-- NEXORA IoT — MySQL 8 schema (clean names; JSON keeps spec names sensors_id/devices_id).
-- Apply: mysql -u <user> -p < schema.sql   (then seed.sql, optionally seed-demo.sql)
-- Deltas vs spec ERD documented in nexora-iot/docs/db-schema-notes.md.

CREATE DATABASE IF NOT EXISTS nexora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexora;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id          INT          NOT NULL AUTO_INCREMENT,
  username    VARCHAR(100) NOT NULL,
  password    VARCHAR(255) NOT NULL,             -- BCrypt hash, never plaintext
  fullname    VARCHAR(150) NOT NULL,
  email       VARCHAR(100) NOT NULL,
  avatar_url  MEDIUMTEXT   NOT NULL,             -- FE uploads the image as a data: URL (<= 2MB file)
  github_url  VARCHAR(255) NOT NULL DEFAULT '',
  figma_url   VARCHAR(255) NOT NULL DEFAULT '',
  postman_url VARCHAR(255) NOT NULL DEFAULT '',
  docs_url    VARCHAR(255) NOT NULL DEFAULT '',
  bio         VARCHAR(500) NOT NULL DEFAULT '',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS sensors (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  unit       VARCHAR(10)  NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS devices (
  id         INT                          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)                 NOT NULL,
  status     ENUM ('on', 'off', 'loading') NOT NULL DEFAULT 'off',
  updated_at DATETIME                     NULL,
  created_at DATETIME                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS data_sensors (
  id        INT      NOT NULL AUTO_INCREMENT,
  sensor_id INT      NOT NULL,
  value     DOUBLE   NOT NULL,                    -- -1 = "no data" (DHT11 absent), kept on purpose
  time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ds_sensor_time (sensor_id, time, id),  -- per-sensor latest/chart + filtered history
  KEY idx_ds_time (time),                        -- unfiltered history ORDER BY time
  CONSTRAINT fk_ds_sensor FOREIGN KEY (sensor_id) REFERENCES sensors (id) ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS actions (
  id        INT                                NOT NULL AUTO_INCREMENT,
  device_id INT                                NOT NULL,
  user_id   INT                                NOT NULL,
  action    ENUM ('on', 'off')                 NOT NULL,
  status    ENUM ('success', 'failed', 'loading') NOT NULL,
  time      DATETIME                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_act_device_time (device_id, time, id),
  KEY idx_act_user (user_id),
  KEY idx_act_time (time),
  CONSTRAINT fk_act_device FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE RESTRICT,
  CONSTRAINT fk_act_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE = InnoDB;
