package vn.ptit.iot.nexora.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import vn.ptit.iot.nexora.MySqlIntegrationTest;
import vn.ptit.iot.nexora.dto.HistoryFilters.SensorHistoryFilter;
import vn.ptit.iot.nexora.dto.HistoryFilters.SensorSearchKind;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.dto.PagedResponse;
import vn.ptit.iot.nexora.dto.SensorDtos.ChartPointDto;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorReadingDto;

/**
 * Server-side history search (value prefix, multi-format time contains, kind filters, paging)
 * verified on real MySQL semantics.
 */
class SensorHistorySearchTest extends MySqlIntegrationTest {

    @Autowired
    private SensorQueryService service;

    @BeforeEach
    void seedRows() {
        insertReading(1, 25.10, "2026-10-05 08:00:00");
        insertReading(1, 25.23, "2026-10-05 08:00:02");
        insertReading(1, 2.25, "2026-09-14 14:35:00");
        insertReading(2, 60, "2026-10-05 08:00:00");
        insertReading(2, -1, "2026-10-05 08:00:02");
        insertReading(3, 45, "2025-03-01 14:31:09");
        insertReading(1, 99.5, "2024-01-01 00:00:00");
    }

    private List<Double> values(String search, SensorSearchKind kind) {
        return search(new SensorHistoryFilter(null, null, null, search, kind), PageParams.of(null, null))
                .items().stream().map(SensorReadingDto::value).toList();
    }

    private PagedResponse<SensorReadingDto> search(SensorHistoryFilter f, PageParams p) {
        return service.history(f, p);
    }

    @Test
    void valueSearchIsStringPrefixNotNumeric() {
        assertThat(values("25", SensorSearchKind.temp)).containsExactly(25.23, 25.1);
        assertThat(values("25.1", SensorSearchKind.temp)).containsExactly(25.1);
        assertThat(values("6", SensorSearchKind.humid)).containsExactly(60.0); // 60 prints as "60"
        assertThat(values("60.", SensorSearchKind.humid)).isEmpty();          // like JS String(60)
        assertThat(values("-1", SensorSearchKind.humid)).containsExactly(-1.0);
    }

    @Test
    void kindRestrictsToItsSensor() {
        assertThat(values("4", SensorSearchKind.light)).containsExactly(45.0);
        assertThat(values("4", SensorSearchKind.temp)).isEmpty();
        assertThat(values("", SensorSearchKind.humid)).hasSize(2);
    }

    @Test
    void timeSearchMatchesAllThreeFormats() {
        assertThat(values("2026/10", SensorSearchKind.time)).hasSize(4);       // yyyy/MM/dd
        assertThat(values("2026-09", SensorSearchKind.time)).containsExactly(2.25); // yyyy-MM-dd
        assertThat(values("14:3", SensorSearchKind.time)).containsExactly(2.25, 45.0);
        assertThat(values("01/03/2025", SensorSearchKind.time)).containsExactly(45.0); // dd/MM/yyyy
        assertThat(values("2024", SensorSearchKind.time)).containsExactly(99.5);
    }

    @Test
    void allKindMatchesValueNameIdOrTime() {
        assertThat(values("độ ẩm", SensorSearchKind.all)).containsExactly(-1.0, 60.0);
        assertThat(values("ÁNH", SensorSearchKind.all)).containsExactly(45.0);
        assertThat(values("99", SensorSearchKind.all)).containsExactly(99.5);
        assertThat(values("2025", SensorSearchKind.all)).containsExactly(45.0);
    }

    @Test
    void likeWildcardsAreLiteral() {
        assertThat(values("%", SensorSearchKind.all)).isEmpty();
        assertThat(values("_", SensorSearchKind.all)).isEmpty();
    }

    @Test
    void filtersRangeAndPaginationEnvelope() {
        PagedResponse<SensorReadingDto> page = search(new SensorHistoryFilter(null,
                        LocalDateTime.parse("2026-10-05T08:00:00"), LocalDateTime.parse("2026-10-05T08:00:01"),
                        null, SensorSearchKind.all), PageParams.of(null, null));
        assertThat(page.items()).extracting(SensorReadingDto::value).containsExactly(60.0, 25.1);

        PagedResponse<SensorReadingDto> p2 = search(new SensorHistoryFilter(1, null, null, null, null),
                PageParams.of(2, 1));
        assertThat(p2.page()).isEqualTo(2);
        assertThat(p2.limit()).isEqualTo(1);
        assertThat(p2.total()).isEqualTo(4);
        assertThat(p2.items()).extracting(SensorReadingDto::value).containsExactly(25.1);

        assertThat(search(new SensorHistoryFilter(7, null, null, null, null), PageParams.of(null, null)).total())
                .isZero();
    }

    @Test
    void invalidPagingAndKindAreRejected() {
        assertThatThrownBy(() -> PageParams.of(0, 20)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> PageParams.of(1, 0)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> SensorSearchKind.parse("xyz")).isInstanceOf(ApiException.class);
        assertThat(SensorSearchKind.parse(null)).isEqualTo(SensorSearchKind.all);
    }

    @Test
    void latestIsTopNPerSensorNewestFirst() {
        assertThat(service.latest(1)).extracting(SensorReadingDto::sensorsId).containsExactly(2, 1, 3);
        assertThat(service.latest(2)).hasSize(5);
    }

    @Test
    void chartReturnsLastNOldestToNewest() {
        List<ChartPointDto> chart = service.chart(1, LocalDateTime.parse("2026-01-01T00:00:00"), null, null);
        assertThat(chart).extracting(ChartPointDto::value).containsExactly(2.25, 25.1, 25.23);
        assertThat(service.chart(1, null, null, 2)).extracting(ChartPointDto::value).containsExactly(25.1, 25.23);
        assertThatThrownBy(() -> service.chart(null, null, null, null)).isInstanceOf(ApiException.class);
    }
}
