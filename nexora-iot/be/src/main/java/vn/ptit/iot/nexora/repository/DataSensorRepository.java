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
     * Chart window averaged into `bucket`-second slots, so a whole range (30m .. 7d) fits in ~limit points.
     * Rows: [slot start, avg value], oldest first; -1 ("no data") readings are skipped.
     */
    @Query(value = """
            select from_unixtime(floor(unix_timestamp(time) / :bucket) * :bucket) as slot, round(avg(value), 2) as v
            from data_sensors
            where sensor_id = :sensorId and time >= :from and time <= :to and value <> -1
            group by slot
            order by slot""", nativeQuery = true)
    List<Object[]> findChartBuckets(int sensorId, LocalDateTime from, LocalDateTime to, long bucket);

    /**
     * Sensor history. `q` is the lowercased search text ('' = no search); `kind`:
     *  value -> value starts with q ("25" finds 25.1, not 2.25)
     *  time  -> q matches the time as the FE writes it (see TimeSearch: "16:12" = hour 16 minute 12)
     *  all   -> value, sensor name, id or time
     */
    @Query("""
            select d from DataSensor d join Sensor s on s.id = d.sensorId
            where (:sensorId is null or d.sensorId = :sensorId)
              and (:from is null or d.time >= :from)
              and (:to is null or d.time <= :to)
              and (:q = ''
                or (:kind = 'value' and cast(d.value as String) like concat(:q, '%'))
                or (:kind = 'time' and """ + TimeSearch.D_TIME_MATCH + """
            )
                or (:kind = 'all' and (
                       cast(d.value as String) like concat(:q, '%')
                    or lower(s.name) like concat('%', :q, '%')
                    or cast(d.id as String) like concat('%', :q, '%')
                    or """ + TimeSearch.D_TIME_MATCH + """
            )))
            order by d.time desc, d.id desc""")
    Page<DataSensor> search(Integer sensorId, LocalDateTime from, LocalDateTime to,
                            String q, String kind, Pageable pageable);
}
