package vn.ptit.iot.nexora.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.ptit.iot.nexora.dto.DeviceDtos.DeviceActionDto;
import vn.ptit.iot.nexora.dto.DeviceDtos.DeviceDto;
import vn.ptit.iot.nexora.dto.HistoryFilters.DeviceHistoryFilter;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.dto.PagedResponse;
import vn.ptit.iot.nexora.repository.DeviceHistoryRepository;
import vn.ptit.iot.nexora.repository.DeviceRepository;

/** Device list (API-08) and action history (API-10). */
@Service
@Transactional(readOnly = true)
public class DeviceQueryService {

    private final DeviceRepository deviceRepository;
    private final DeviceHistoryRepository historyRepository;

    public DeviceQueryService(DeviceRepository deviceRepository, DeviceHistoryRepository historyRepository) {
        this.deviceRepository = deviceRepository;
        this.historyRepository = historyRepository;
    }

    public List<DeviceDto> devices() {
        return deviceRepository.findAllByOrderByIdAsc().stream().map(DeviceDto::from).toList();
    }

    public PagedResponse<DeviceActionDto> history(DeviceHistoryFilter filter, PageParams page) {
        return historyRepository.search(filter, page);
    }
}
