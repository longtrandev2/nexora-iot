package vn.ptit.iot.nexora.repository;

/**
 * Builds the JPQL condition "time column matches the search text `:q`" (compile-time constant, usable in @Query).
 *
 * The time is rendered in every format the FE shows/accepts (with and without seconds), joined by '|':
 *   |14/10/2026 16:12:51|14/10/2026 16:12|2026-10-14 16:12:51|2026-10-14 16:12|2026/10/14 16:12:51|2026/10/14 16:12
 *   |16:12:51 14/10/2026|16:12 14/10/2026
 * (first = the FE table display "dd/MM/yyyy HH:mm:ss") and `:q` must start at a part boundary
 * ('|', ' ', '/', '-') — never right after ':'.
 * So "14/10/2026 16:12" / "16:12" find 16:12:xx only, not 15:16:12 (where 16 is the minute); "14:30",
 * "14/10/2026", "10/2026", "2026/10" and full timestamps keep working.
 */
final class TimeSearch {

    private static final String FORMATS =
            "'|%d/%m/%Y %H:%i:%s|%d/%m/%Y %H:%i|%Y-%m-%d %H:%i:%s|%Y-%m-%d %H:%i|%Y/%m/%d %H:%i:%s|%Y/%m/%d %H:%i"
            + "|%H:%i:%s %d/%m/%Y|%H:%i %d/%m/%Y'";

    private static final String D_TEXT = "cast(function('DATE_FORMAT', d.time, " + FORMATS + ") as String)";
    private static final String A_TEXT = "cast(function('DATE_FORMAT', a.time, " + FORMATS + ") as String)";

    /** Condition on `d.time` (DataSensor alias d). */
    static final String D_TIME_MATCH = "(" + D_TEXT + " like concat('%|', :q, '%') or "
            + D_TEXT + " like concat('% ', :q, '%') or "
            + D_TEXT + " like concat('%/', :q, '%') or "
            + D_TEXT + " like concat('%-', :q, '%'))";

    /** Condition on `a.time` (DeviceAction alias a). */
    static final String A_TIME_MATCH = "(" + A_TEXT + " like concat('%|', :q, '%') or "
            + A_TEXT + " like concat('% ', :q, '%') or "
            + A_TEXT + " like concat('%/', :q, '%') or "
            + A_TEXT + " like concat('%-', :q, '%'))";

    private TimeSearch() {
    }
}
