-- Schema de la base de donnees Medical Wellness
-- Charset: utf8mb4

CREATE TABLE IF NOT EXISTS patients (
  id            VARCHAR(32)  PRIMARY KEY,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  phone         VARCHAR(32)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  gender        ENUM('M','F') NOT NULL DEFAULT 'F',
  birth_date    DATE         NOT NULL,
  address       VARCHAR(255) NOT NULL,
  notes         TEXT,
  status        ENUM('actif','inactif') NOT NULL DEFAULT 'actif',
  total_spent   DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_visit    DATE,
  next_appointment DATE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_patients_name (last_name, first_name),
  INDEX idx_patients_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(32)  PRIMARY KEY,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  role          VARCHAR(40)  NOT NULL,
  avatar        VARCHAR(255),
  department    VARCHAR(80),
  service_id    VARCHAR(32),
  last_login    DATETIME,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS appointments (
  id            VARCHAR(32)  PRIMARY KEY,
  patient_id    VARCHAR(32)  NOT NULL,
  date          DATE         NOT NULL,
  time          VARCHAR(8)   NOT NULL,
  type          VARCHAR(80)  NOT NULL,
  status        ENUM('planifie','confirme','termine','annule') NOT NULL DEFAULT 'planifie',
  notes         TEXT,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  INDEX idx_appointments_date (date),
  INDEX idx_appointments_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
