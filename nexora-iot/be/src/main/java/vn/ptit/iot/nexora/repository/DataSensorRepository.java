package vn.ptit.iot.nexora.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.ptit.iot.nexora.entity.DataSensor;

public interface DataSensorRepository extends JpaRepository<DataSensor, Integer> {

    /** Newest readings of one sensor (dashboard cards). */
    List<DataSensor> findBySensorIdOrderByTimeDescIdDesc(Integer sensorId, Pageable pageable);

    /** Chart window of one sensor, newest first (the service reverses it). */
    @Query("""
            select d from DataSensor d
            where d.sensorId = :sensorId
              and (:from is null or d.time >= :from)
              and (:to is null or d.time <= :to)
            order by d.time desc, d.id desc""")
    List<DataSensor> findChart(Integer sensorId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    /**
     * Sensor history. `q` is the lowercased search text ('' = no search); `kind`:
     *  value -> value starts with q ("25" finds 25.1, not 2.25)
     *  time  -> q appears in the time, written like the FE shows it (2026, 2026/10, 14:3 ...)
     *  all   -> value, sensor name, id or time
     */
    @Query("""
            select d from DataSensor d join Sensor s on s.id = d.sensorId
            where (:sensorId is null or d.sensorId = :sensorId)
              and (:from is null or d.time >= :from)
              and (:to is null or d.time <= :to)
              and (:q = ''
                or (:kind = 'value' and cast(d.value as String) like concat(:q, '%'))
                or (:kind = 'time' and (
                       cast(function('DATE_FORMAT', d.time, '%Y-%m-%d %H:%i:%s') as String) like concat('%', :q, '%')
                    or cast(function('DATE_FORMAT', d.time, '%H:%i:%s %d/%m/%Y') as String) like concat('%', :q, '%')
                    or cast(function('DATE_FORMAT', d.time, '%Y/%m/%d %H:%i:%s') as String) like concat('%', :q, '%')))
                or (:kind = 'all' and (
                       cast(d.value as String) like concat(:q, '%')
                    or lower(s.name) like concat('%', :q, '%')
                    or cast(d.id as String) like concat('%', :q, '%')
                    or cast(function('DATE_FORMAT', d.time, '%Y-%m-%d %H:%i:%s') as String) like concat('%', :q, '%')
                    or cast(function('DATE_FORMAT', d.time, '%H:%i:%s %d/%m/%Y') as String) like concat('%', :q, '%')
                    or cast(function('DATE_FORMAT', d.time, '%Y/%m/%d %H:%i:%s') as String) like concat('%', :q, '%'))))
            order by d.time desc, d.id desc""")
    Page<DataSensor> search(Integer sensorId, LocalDateTime from, LocalDateTime to,
                            String q, String kind, Pageable pageable);
}
