package vn.ptit.iot.nexora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.ptit.iot.nexora.entity.Device;

public interface DeviceRepository extends JpaRepository<Device, Integer> {

    List<Device> findAllByOrderByIdAsc();
}
