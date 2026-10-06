package vn.ptit.iot.nexora.repository;

import java.time.LocalDateTime;
import java.util.Locale;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;

/**
 * Small dynamic-WHERE builder for the history queries. Only fixed SQL fragments are appended;
 * every user value is a bound parameter (no injection surface).
 * Time search matches the formats the FE displays ("yyyy-MM-dd HH:mm:ss", "HH:mm:ss dd/MM/yyyy",
 * "yyyy/MM/dd HH:mm:ss"), so "2026", "2026/09" or "14:3" all find what the user sees.
 */
final class SqlSearch {

    private final StringBuilder where = new StringBuilder(" WHERE 1 = 1");
    private final MapSqlParameterSource params = new MapSqlParameterSource();

    SqlSearch eq(String column, String param, Object value) {
        if (value != null) {
            where.append(" AND ").append(column).append(" = :").append(param);
            params.addValue(param, value);
        }
        return this;
    }

    SqlSearch timeRange(String column, LocalDateTime from, LocalDateTime to) {
        if (from != null) {
            where.append(" AND ").append(column).append(" >= :fromTime");
            params.addValue("fromTime", from);
        }
        if (to != null) {
            where.append(" AND ").append(column).append(" <= :toTime");
            params.addValue("toTime", to);
        }
        return this;
    }

    /** Appends `AND (<condition>)`; the condition may reference :prefix / :contains. */
    SqlSearch and(String condition) {
        where.append(" AND (").append(condition).append(')');
        return this;
    }

    /** Binds :prefix ("needle%") and :contains ("%needle%") with LIKE wildcards escaped. */
    SqlSearch bindNeedle(String needle) {
        String escaped = escapeLike(needle);
        params.addValue("prefix", escaped + "%");
        params.addValue("contains", "%" + escaped + "%");
        return this;
    }

    String where() {
        return where.toString();
    }

    MapSqlParameterSource params() {
        return params;
    }

    /** FE needle normalization: trim + lowercase; null -> "". */
    static String normalizeNeedle(String search) {
        return search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
    }

    /** Needle is a substring of any of the 3 display formats of `column`. */
    static String timeContains(String column) {
        return "DATE_FORMAT(" + column + ", '%Y-%m-%d %H:%i:%s') LIKE :contains"
                + " OR DATE_FORMAT(" + column + ", '%H:%i:%s %d/%m/%Y') LIKE :contains"
                + " OR DATE_FORMAT(" + column + ", '%Y/%m/%d %H:%i:%s') LIKE :contains";
    }

    /** `%`, `_` and `\` match literally (JS `includes` / `startsWith` semantics). */
    static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
