package vn.ptit.iot.nexora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.ApiDto.RainThreshold;
import vn.ptit.iot.nexora.service.SettingService;

/** Rain warning threshold (0..100 %), stored in DB so every browser sees the same value. */
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settings;

    @GetMapping("/rain-threshold")
    public RainThreshold rainThreshold() {
        return new RainThreshold(settings.rainThreshold());
    }

    /** Body {"value": 70}; 400 when outside 0..100. */
    @PutMapping("/rain-threshold")
    public RainThreshold updateRainThreshold(@RequestBody RainThreshold body) {
        return new RainThreshold(settings.updateRainThreshold(body == null ? null : body.value()));
    }
}
