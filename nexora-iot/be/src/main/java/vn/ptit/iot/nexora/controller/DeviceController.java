package vn.ptit.iot.nexora.controller;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.ApiDto.ControlRequest;
import vn.ptit.iot.nexora.dto.ApiDto.ControlResult;
import vn.ptit.iot.nexora.dto.ApiDto.DeviceActionDto;
import vn.ptit.iot.nexora.dto.ApiDto.DeviceDto;
import vn.ptit.iot.nexora.dto.ApiDto.Paged;
import vn.ptit.iot.nexora.entity.DeviceAction;
import vn.ptit.iot.nexora.service.DeviceService;

/** LED list, on/off control (waits for the ESP32), on/off history. */
@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService devices;

    @GetMapping
    public List<DeviceDto> devices() {
        return devices.devices();
    }

    @PostMapping("/control")
    public List<ControlResult> control(@AuthenticationPrincipal Integer userId, @RequestBody ControlRequest req) {
        return devices.control(userId, req);
    }

    @GetMapping("/history")
    public Paged<DeviceActionDto> history(@RequestParam(name = "device_id", required = false) Integer deviceId,
                                          @RequestParam(required = false) DeviceAction.Command action,
                                          @RequestParam(required = false) DeviceAction.Result status,
                                          @RequestParam(required = false) LocalDateTime from,
                                          @RequestParam(required = false) LocalDateTime to,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(required = false) Integer page,
                                          @RequestParam(required = false) Integer limit) {
        return devices.history(deviceId, action, status, from, to, search, page, limit);
    }
}
