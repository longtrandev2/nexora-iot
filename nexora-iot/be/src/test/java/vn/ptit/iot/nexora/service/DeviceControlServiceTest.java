package vn.ptit.iot.nexora.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import vn.ptit.iot.nexora.MySqlIntegrationTest;
import vn.ptit.iot.nexora.dto.DeviceDtos.ControlRequest;
import vn.ptit.iot.nexora.dto.DeviceDtos.ControlResult;
import vn.ptit.iot.nexora.entity.DeviceStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;
import vn.ptit.iot.nexora.mqtt.DeviceResponseHandler;
import vn.ptit.iot.nexora.mqtt.MqttPublisher;
import vn.ptit.iot.nexora.mqtt.MqttPublisher.MqttUnavailableException;

/**
 * UC03 closed loop with a fake ESP32 that applies the firmware's exact indexOf parsing and echoes
 * the full LED state on device_response (asynchronously, like the real broker round-trip).
 * Timeout is 1.5s in tests (30s in prod).
 */
class DeviceControlServiceTest extends MySqlIntegrationTest {

    @MockitoBean
    private MqttPublisher mqtt;

    @Autowired
    private DeviceControlService service;

    @Autowired
    private DeviceResponseHandler responseHandler;

    @Autowired
    private PendingCommandRegistry registry;

    private final boolean[] leds = new boolean[3];

    @BeforeEach
    void wireFakeEsp32() {
        Arrays.fill(leds, false);
        doAnswer(inv -> {
            String msg = inv.getArgument(1, String.class).toLowerCase();
            if (msg.contains("all:on")) Arrays.fill(leds, true);
            else if (msg.contains("all:off")) Arrays.fill(leds, false);
            for (int i = 0; i < 3; i++) {
                if (msg.contains("led" + (i + 1) + ":on")) leds[i] = true;
                if (msg.contains("led" + (i + 1) + ":off")) leds[i] = false;
            }
            String echo = "{led1:" + state(0) + ",led2:" + state(1) + ",led3:" + state(2) + "}";
            CompletableFuture.runAsync(() -> responseHandler.handle(echo));
            return null;
        }).when(mqtt).publish(eq("device_control"), anyString());
    }

    private String state(int i) {
        return leds[i] ? "on" : "off";
    }

    private List<String> actionStatuses() {
        return jdbc.queryForList("SELECT status FROM actions ORDER BY id", String.class);
    }

    private String deviceStatus(int id) {
        return jdbc.queryForObject("SELECT status FROM devices WHERE id = ?", String.class, id);
    }

    @Test
    void singleDeviceIsConfirmedByHardwareEcho() {
        List<ControlResult> results = service.control(1, new ControlRequest(2, null, ToggleAction.on));
        assertThat(results).containsExactly(new ControlResult(2, "LED 2", DeviceStatus.on));
        verify(mqtt).publish("device_control", "{led2:on}");
        assertThat(actionStatuses()).containsExactly("success");
        assertThat(deviceStatus(2)).isEqualTo("on");
        assertThat(jdbc.queryForObject("SELECT updated_at IS NOT NULL FROM devices WHERE id = 2", Boolean.class))
                .isTrue();
    }

    @Test
    void bulkAllTogglesEveryDeviceAndLogsOneRowEach() {
        List<ControlResult> results = service.control(1, new ControlRequest(null, ToggleAction.on, null));
        assertThat(results).extracting(ControlResult::devicesId).containsExactly(1, 2, 3);
        assertThat(results).extracting(ControlResult::status).containsOnly(DeviceStatus.on);
        verify(mqtt).publish("device_control", "{all:on}");
        assertThat(actionStatuses()).containsExactly("success", "success", "success");
    }

    @Test
    void silentDeviceTimesOutWith504FailedRowsAndRevert() {
        jdbc.update("UPDATE devices SET status = 'on' WHERE id = 1");
        doAnswer(inv -> null).when(mqtt).publish(eq("device_control"), anyString());
        assertThatThrownBy(() -> service.control(1, new ControlRequest(1, null, ToggleAction.off)))
                .isInstanceOfSatisfying(ApiException.class, e -> {
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.GATEWAY_TIMEOUT);
                    assertThat(e.getMessage()).isEqualTo("Thiết bị không phản hồi");
                });
        assertThat(actionStatuses()).containsExactly("failed");
        assertThat(deviceStatus(1)).isEqualTo("on");
        assertThat(registry.isPending(1)).isFalse();
    }

    @Test
    void brokerDownIs503AndNothingStaysLoading() {
        doThrow(new MqttUnavailableException("down", null)).when(mqtt).publish(eq("device_control"), anyString());
        assertThatThrownBy(() -> service.control(1, new ControlRequest(3, null, ToggleAction.on)))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
        assertThat(actionStatuses()).containsExactly("failed");
        assertThat(deviceStatus(3)).isEqualTo("off");
    }

    @Test
    void commandWhileDeviceInFlightIsRejected() {
        Map<Integer, CompletableFuture<DeviceStatus>> held =
                registry.tryRegister(List.of(2), DeviceStatus.on).orElseThrow();
        try {
            assertThatThrownBy(() -> service.control(1, new ControlRequest(2, null, ToggleAction.on)))
                    .hasMessage("Thiết bị đang có lệnh đang xử lý");
            assertThatThrownBy(() -> service.control(1, new ControlRequest(null, ToggleAction.off, null)))
                    .hasMessage("Thiết bị đang có lệnh đang xử lý");
        } finally {
            registry.release(held);
        }
        assertThat(actionStatuses()).isEmpty();
    }

    @Test
    void invalidRequestsAreRejectedBeforeAnyWrite() {
        assertThatThrownBy(() -> service.control(1, new ControlRequest(null, null, ToggleAction.on)))
                .hasMessage("Thiếu thiết bị cần điều khiển");
        assertThatThrownBy(() -> service.control(1, new ControlRequest(9, null, ToggleAction.on)))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
        assertThatThrownBy(() -> service.control(1, new ControlRequest(1, null, null)))
                .isInstanceOf(ApiException.class);
        assertThat(actionStatuses()).isEmpty();
    }

    /** Firmware has no correlation id: LED 1's echo (LED 2 still off) arrives while LED 2's command waits. */
    @Test
    void staleEchoOfEarlierCommandDoesNotSettleNewerCommand() throws Exception {
        doAnswer(inv -> null).when(mqtt).publish(eq("device_control"), anyString());
        CompletableFuture<List<ControlResult>> led2 = CompletableFuture.supplyAsync(
                () -> service.control(1, new ControlRequest(2, null, ToggleAction.on)));
        await(() -> registry.isPending(2));

        responseHandler.handle("{led1:on,led2:off,led3:off}"); // echo of an earlier LED 1 command
        Thread.sleep(300);
        assertThat(led2).isNotDone();
        assertThat(deviceStatus(2)).isEqualTo("loading");

        responseHandler.handle("{led1:on,led2:on,led3:off}");  // echo of LED 2's own command
        assertThat(led2.get(2, TimeUnit.SECONDS))
                .containsExactly(new ControlResult(2, "LED 2", DeviceStatus.on));
        assertThat(actionStatuses()).containsExactly("success");
    }

    @Test
    void echoArrivingAfterTimeoutStillSyncsTheDevice() throws Exception {
        doAnswer(inv -> {
            CompletableFuture.runAsync(() -> responseHandler.handle("{led1:off,led2:off,led3:on}"),
                    CompletableFuture.delayedExecutor(1800, TimeUnit.MILLISECONDS));
            return null;
        }).when(mqtt).publish(eq("device_control"), anyString());
        assertThatThrownBy(() -> service.control(1, new ControlRequest(3, null, ToggleAction.on)))
                .hasMessage("Thiết bị không phản hồi");
        assertThat(deviceStatus(3)).isEqualTo("off");
        await(() -> "on".equals(deviceStatus(3)));
        assertThat(actionStatuses()).containsExactly("failed");
    }

    private static void await(BooleanSupplier condition) throws InterruptedException {
        long deadline = System.currentTimeMillis() + 3000;
        while (!condition.getAsBoolean()) {
            if (System.currentTimeMillis() > deadline) throw new AssertionError("condition not met in 3s");
            Thread.sleep(20);
        }
    }

    @Test
    void unsolicitedResponseSyncsDeviceStateWithoutRows() {
        responseHandler.handle("{led1:on,led2:off,led3:on}");
        assertThat(deviceStatus(1)).isEqualTo("on");
        assertThat(deviceStatus(3)).isEqualTo("on");
        assertThat(actionStatuses()).isEmpty();
    }
}
