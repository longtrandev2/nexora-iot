package vn.ptit.iot.nexora.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.ptit.iot.nexora.entity.DataSensor;

public interface DataSensorRepository extends JpaRepository<DataSensor, Integer> {

    /** Newest-first readings of one sensor (served by idx_ds_sensor_time). */
    List<DataSensor> findBySensorIdOrderByTimeDescIdDesc(Integer sensorId, Pageable pageable);

    /** Chart window, newest first; caller reverses to oldest -> newest. Null bounds = open. */
    @Query("""
            select d from DataSensor d
            where d.sensorId = :sensorId
              and (:from is null or d.time >= :from)
              and (:to is null or d.time <= :to)
            order by d.time desc, d.id desc""")
    List<DataSensor> findChartWindow(@Param("sensorId") Integer sensorId,
                                     @Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to,
                                     Pageable pageable);
}
