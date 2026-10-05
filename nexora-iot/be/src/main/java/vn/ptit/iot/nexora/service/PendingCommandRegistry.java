package vn.ptit.iot.nexora.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import vn.ptit.iot.nexora.entity.DeviceStatus;

/**
 * In-flight device commands: device id -> (target state, future completed by device_response).
 * Registration is all-or-nothing so a device never has two commands in flight (E3).
 *
 * The firmware echoes the FULL LED state after every command and has no correlation id, so an
 * echo of an earlier command (e.g. LED 1's reply while LED 2's command is in flight) carries a
 * stale state for other LEDs. Only an echo matching the target completes the wait; a stale one is
 * swallowed (no sync while the device is loading). A command that really fails ends in the 504.
 */
@Component
public class PendingCommandRegistry {

    private record Pending(DeviceStatus target, CompletableFuture<DeviceStatus> future) {
    }

    private final Map<Integer, Pending> pending = new ConcurrentHashMap<>();

    /** Registers one wait per id, or returns empty if ANY id already has a command in flight. */
    public synchronized Optional<Map<Integer, CompletableFuture<DeviceStatus>>> tryRegister(
            List<Integer> ids, DeviceStatus target) {
        if (ids.stream().anyMatch(pending::containsKey)) return Optional.empty();
        Map<Integer, CompletableFuture<DeviceStatus>> registered = new LinkedHashMap<>();
        for (Integer id : ids) {
            CompletableFuture<DeviceStatus> future = new CompletableFuture<>();
            pending.put(id, new Pending(target, future));
            registered.put(id, future);
        }
        return Optional.of(registered);
    }

    /**
     * Offers a hardware-reported state. Returns false only when no command is in flight for the
     * device (the caller then treats it as a plain state sync).
     */
    public boolean offer(int deviceId, DeviceStatus reported) {
        Pending p = pending.get(deviceId);
        if (p == null) return false;
        if (reported == p.target()) p.future().complete(reported);
        return true;
    }

    /** Removes exactly the waits this command registered (never another command's). */
    public synchronized void release(Map<Integer, CompletableFuture<DeviceStatus>> registered) {
        registered.forEach((id, future) -> {
            Pending p = pending.get(id);
            if (p != null && p.future() == future) pending.remove(id);
        });
    }

    public boolean isPending(int deviceId) {
        return pending.containsKey(deviceId);
    }
}
