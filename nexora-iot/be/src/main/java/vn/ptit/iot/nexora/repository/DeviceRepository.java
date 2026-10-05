package vn.ptit.iot.nexora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.entity.DeviceStatus;

public interface DeviceRepository extends JpaRepository<Device, Integer> {

    List<Device> findAllByOrderByIdAsc();

    List<Device> findByStatus(DeviceStatus status);
}
