package vn.ptit.iot.nexora.controller;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.DeviceDtos.ControlRequest;
import vn.ptit.iot.nexora.dto.DeviceDtos.ControlResult;
import vn.ptit.iot.nexora.dto.DeviceDtos.DeviceActionDto;
import vn.ptit.iot.nexora.dto.DeviceDtos.DeviceDto;
import vn.ptit.iot.nexora.dto.HistoryFilters.DeviceHistoryFilter;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.dto.PagedResponse;
import vn.ptit.iot.nexora.entity.ActionStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;
import vn.ptit.iot.nexora.service.DeviceControlService;
import vn.ptit.iot.nexora.service.DeviceQueryService;

/** API-08 (list), API-09 (control, + E-1 bulk), API-10 (history, + E-2 user_name). */
@RestController
@RequestMapping("/api/v1/devices")
public class DeviceController {

    private final DeviceQueryService deviceQueryService;
    private final DeviceControlService deviceControlService;

    public DeviceController(DeviceQueryService deviceQueryService, DeviceControlService deviceControlService) {
        this.deviceQueryService = deviceQueryService;
        this.deviceControlService = deviceControlService;
    }

    @GetMapping
    public List<DeviceDto> devices() {
        return deviceQueryService.devices();
    }

    /** Resolves after the ESP32 confirms (or 504 after the timeout). Always an array. */
    @PostMapping("/control")
    public List<ControlResult> control(@AuthenticationPrincipal Integer userId,
                                       @RequestBody(required = false) ControlRequest request) {
        return deviceControlService.control(userId, request);
    }

    @GetMapping("/history")
    public PagedResponse<DeviceActionDto> history(
            @RequestParam(name = "device_id", required = false) Integer deviceId,
            @RequestParam(required = false) ToggleAction action,
            @RequestParam(required = false) ActionStatus status,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {
        DeviceHistoryFilter filter = new DeviceHistoryFilter(deviceId, action, status, from, to, search);
        return deviceQueryService.history(filter, PageParams.of(page, limit));
    }
}
