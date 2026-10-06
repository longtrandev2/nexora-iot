package vn.ptit.iot.nexora.repository;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.ptit.iot.nexora.entity.DeviceAction;

public interface DeviceActionRepository extends JpaRepository<DeviceAction, Integer> {

    /** On/off history; `q` ('' = none) is searched in the time as the FE displays it. */
    @Query("""
            select a from DeviceAction a
            where (:deviceId is null or a.deviceId = :deviceId)
              and (:action is null or a.action = :action)
              and (:status is null or a.status = :status)
              and (:from is null or a.time >= :from)
              and (:to is null or a.time <= :to)
              and (:q = ''
                or cast(function('DATE_FORMAT', a.time, '%Y-%m-%d %H:%i:%s') as String) like concat('%', :q, '%')
                or cast(function('DATE_FORMAT', a.time, '%H:%i:%s %d/%m/%Y') as String) like concat('%', :q, '%')
                or cast(function('DATE_FORMAT', a.time, '%Y/%m/%d %H:%i:%s') as String) like concat('%', :q, '%'))
            order by a.time desc, a.id desc""")
    Page<DeviceAction> search(Integer deviceId, DeviceAction.Command action, DeviceAction.Result status,
                              LocalDateTime from, LocalDateTime to, String q, Pageable pageable);
}
