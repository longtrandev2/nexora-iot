package vn.ptit.iot.nexora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.ptit.iot.nexora.entity.Sensor;

public interface SensorRepository extends JpaRepository<Sensor, Integer> {
}
