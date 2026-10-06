package vn.ptit.iot.nexora.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import vn.ptit.iot.nexora.MySqlIntegrationTest;
import vn.ptit.iot.nexora.dto.DeviceDtos.DeviceActionDto;
import vn.ptit.iot.nexora.dto.DeviceDtos.DeviceDto;
import vn.ptit.iot.nexora.dto.HistoryFilters.DeviceHistoryFilter;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.entity.ActionStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;

/** API-08 + API-10: filters, time-contains search, user_name join, empty updated_at. */
class DeviceHistorySearchTest extends MySqlIntegrationTest {

    @Autowired
    private DeviceQueryService service;

    @BeforeEach
    void seedRows() {
        insertAction(1, "on", "success", "2026-10-05 14:30:00");
        insertAction(2, "off", "failed", "2026-09-14 14:35:10");
        insertAction(3, "on", "loading", "2025-01-02 09:00:00");
    }

    private List<Integer> ids(DeviceHistoryFilter filter) {
        return service.history(filter, PageParams.of(null, null)).items().stream()
                .map(DeviceActionDto::devicesId).toList();
    }

    @Test
    void newestFirstWithJoinedNames() {
        List<DeviceActionDto> items = service.history(
                new DeviceHistoryFilter(null, null, null, null, null, null), PageParams.of(null, null)).items();
        assertThat(items).extracting(DeviceActionDto::devicesId).containsExactly(1, 2, 3);
        assertThat(items.get(0).devicesName()).isEqualTo("LED 1");
        assertThat(items.get(0).userName()).isEqualTo("Trần Khắc Long");
        assertThat(items.get(0).time()).hasToString("2026-10-05T14:30");
    }

    @Test
    void filtersByDeviceActionAndStatus() {
        assertThat(ids(new DeviceHistoryFilter(2, null, null, null, null, null))).containsExactly(2);
        assertThat(ids(new DeviceHistoryFilter(null, ToggleAction.on, null, null, null, null))).containsExactly(1, 3);
        assertThat(ids(new DeviceHistoryFilter(null, null, ActionStatus.loading, null, null, null)))
                .containsExactly(3);
    }

    @Test
    void searchIsTimeContainsOnly() {
        assertThat(ids(new DeviceHistoryFilter(null, null, ActionStatus.failed, null, null, "14:3")))
                .containsExactly(2);
        assertThat(ids(new DeviceHistoryFilter(null, null, null, null, null, "2026/10"))).containsExactly(1);
        assertThat(ids(new DeviceHistoryFilter(null, null, null, null, null, "02/01/2025"))).containsExactly(3);
        assertThat(ids(new DeviceHistoryFilter(null, null, null, null, null, "LED"))).isEmpty();
    }

    @Test
    void deviceListHasEmptyUpdatedAtWhenNeverToggled() {
        assertThat(service.devices()).extracting(DeviceDto::updatedAt).containsOnly("");
    }
}
