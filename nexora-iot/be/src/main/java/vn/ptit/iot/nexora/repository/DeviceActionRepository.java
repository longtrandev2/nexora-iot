package vn.ptit.iot.nexora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.ptit.iot.nexora.entity.DeviceAction;

public interface DeviceActionRepository extends JpaRepository<DeviceAction, Integer> {
}
