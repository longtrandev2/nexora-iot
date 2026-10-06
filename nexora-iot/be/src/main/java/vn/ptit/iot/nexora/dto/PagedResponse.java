package vn.ptit.iot.nexora.dto;

import java.util.List;

/** FE `Paged<T>` envelope: {items, page, limit, total}. */
public record PagedResponse<T>(List<T> items, int page, int limit, long total) {
}
