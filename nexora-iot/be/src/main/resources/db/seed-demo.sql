-- NEXORA IoT — demo history seed (deterministic, mirrors fe/src/services/mock/mock-simulator.ts).
-- WARNING: RESETS the logs — deletes ALL rows in data_sensors + actions, then regenerates:
--   * per sensor 300 sparse ticks over ~2 years (varied years/months for time-search demos)
--     + 1700 dense ticks over the last ~24h (pretty dashboard chart)  => 2000 rows/sensor
--   * humid = -1 every 13th tick (DHT11 absent marker -> FE "Không có dữ liệu")
--   * 40 device actions over ~2 years; newest 3 forced to loading / failed / success
--   * devices.status = newest 'success' action per device (same replay rule as the mock)
-- Apply AFTER schema.sql + seed.sql:  mysql -u <user> -p nexora < seed-demo.sql

USE nexora;
SET NAMES utf8mb4;
SET SESSION cte_max_recursion_depth = 5000;
SET @now = NOW();

DELETE FROM actions;
DELETE FROM data_sensors;

-- ---------- sensor ticks ----------
INSERT INTO data_sensors (sensor_id, value, time)
WITH RECURSIVE seq (n) AS (
  SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 2000
),
ticks AS (
  SELECT n,
         CASE
           WHEN n <= 300 THEN @now - INTERVAL ((301 - n) * 210240) SECOND -- 2y / 300 ticks
           ELSE @now - INTERVAL ((2001 - n) * 50) SECOND                   -- ~24h / 1700 ticks
         END AS t
  FROM seq
)
SELECT 1, ROUND(28.5 + 3 * SIN(n * 0.07) + 0.8 * SIN(n * 1.3), 2), t FROM ticks
UNION ALL
SELECT 2, IF(MOD(n, 13) = 0, -1, ROUND(62 + 12 * SIN(n * 0.031) + 3 * SIN(n * 0.9))), t FROM ticks
UNION ALL
SELECT 3, GREATEST(0, LEAST(100, ROUND(50 + 40 * SIN((HOUR(t) - 6) * PI() / 12) + 6 * SIN(n * 1.7)))), t
FROM ticks;

-- ---------- device actions ----------
INSERT INTO actions (device_id, user_id, action, status, time)
WITH RECURSIVE acts (k, minutes_ago) AS (
  SELECT 0, 25
  UNION ALL
  SELECT k + 1, minutes_ago + (5 + MOD(k * 17, 31)) * 1440 FROM acts WHERE k < 39
)
SELECT 1 + MOD(k * 7, 3),
       1,
       IF(MOD(k * 3, 5) < 3, 'on', 'off'),
       CASE
         WHEN k = 0 THEN 'loading'
         WHEN k = 1 THEN 'failed'
         WHEN k = 2 THEN 'success'
         WHEN MOD(k * 11, 20) < 14 THEN 'success'
         WHEN MOD(k * 11, 20) < 17 THEN 'failed'
         ELSE 'loading'
       END,
       @now - INTERVAL minutes_ago MINUTE
FROM acts;

-- ---------- device state = newest successful command ----------
UPDATE devices SET status = 'off', updated_at = NULL;
UPDATE devices d
JOIN (
  SELECT a.device_id, a.action, a.time
  FROM actions a
  WHERE a.status = 'success'
    AND a.id = (SELECT a2.id FROM actions a2
                WHERE a2.device_id = a.device_id AND a2.status = 'success'
                ORDER BY a2.time DESC, a2.id DESC LIMIT 1)
) latest ON latest.device_id = d.id
SET d.status = latest.action, d.updated_at = latest.time;
