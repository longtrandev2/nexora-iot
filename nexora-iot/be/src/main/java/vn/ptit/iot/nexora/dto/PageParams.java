package vn.ptit.iot.nexora.dto;

import vn.ptit.iot.nexora.service.ApiException;

/** Validated pagination input (defaults page=1, limit=20, like the FE mock). */
public record PageParams(int page, int limit) {

    public static final int DEFAULT_LIMIT = 20;
    public static final int MAX_LIMIT = 500;

    public static PageParams of(Integer page, Integer limit) {
        int p = page == null ? 1 : page;
        int l = limit == null ? DEFAULT_LIMIT : limit;
        if (p < 1) throw ApiException.badRequest("Trang (page) phải lớn hơn hoặc bằng 1");
        if (l < 1 || l > MAX_LIMIT) {
            throw ApiException.badRequest("Số dòng mỗi trang (limit) phải từ 1 đến " + MAX_LIMIT);
        }
        return new PageParams(p, l);
    }

    public long offset() {
        return (long) (page - 1) * limit;
    }

    public <T> PagedResponse<T> wrap(java.util.List<T> items, long total) {
        return new PagedResponse<>(items, page, limit, total);
    }
}
