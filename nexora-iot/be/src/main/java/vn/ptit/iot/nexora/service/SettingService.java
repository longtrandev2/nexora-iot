package vn.ptit.iot.nexora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.ptit.iot.nexora.entity.AppSetting;
import vn.ptit.iot.nexora.repository.AppSettingRepository;

/** App settings; for now only the rain warning threshold (dashboard card blinks when rain >= threshold). */
@Service
@RequiredArgsConstructor
public class SettingService {

    public static final int DEFAULT_RAIN_THRESHOLD = 70;

    private final AppSettingRepository settings;

    public int rainThreshold() {
        return settings.findById(AppSetting.RAIN_THRESHOLD)
                .map(s -> parseOrDefault(s.getValue()))
                .orElse(DEFAULT_RAIN_THRESHOLD);
    }

    public int updateRainThreshold(Integer value) {
        if (value == null || value < 0 || value > 100) {
            throw ApiException.badRequest("Ngưỡng độ mưa phải từ 0 đến 100");
        }
        settings.save(new AppSetting(AppSetting.RAIN_THRESHOLD, String.valueOf(value)));
        return value;
    }

    private static int parseOrDefault(String raw) {
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            return DEFAULT_RAIN_THRESHOLD;
        }
    }
}
