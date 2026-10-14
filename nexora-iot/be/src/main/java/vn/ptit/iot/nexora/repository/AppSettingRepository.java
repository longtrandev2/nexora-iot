package vn.ptit.iot.nexora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.ptit.iot.nexora.entity.AppSetting;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {
}
