"use strict";

const mysql = require("mysql2/promise");

// Configuration de la connexion MySQL.
// En production, ces valeurs viennent de variables d'environnement.
const config = {
  host: process.env.MW_DB_HOST || "127.0.0.1",
  port: Number(process.env.MW_DB_PORT || 3306),
  user: process.env.MW_DB_USER || "root",
  password: process.env.MW_DB_PASSWORD || "",
  database: process.env.MW_DB_NAME || "medical_wellness",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let connected = false;

async function init() {
  try {
    pool = mysql.createPool(config);
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    connected = true;
    console.log("[db] Connexion MySQL etablie (" + config.host + ":" + config.port + "/" + config.database + ")");
    return true;
  } catch (err) {
    connected = false;
    pool = null;
    console.warn("[db] MySQL indisponible, mode hors-ligne (donnees de demonstration) :", err.message);
    return false;
  }
}

function isAvailable() {
  return connected && pool !== null;
}

async function query(sql, params) {
  if (!isAvailable()) throw new Error("Base de donnees indisponible");
  const [rows] = await pool.execute(sql, params || []);
  return rows;
}

// ---------- Patients ----------

async function listPatients() {
  const rows = await query(
    "SELECT id, first_name AS firstName, last_name AS lastName, phone, email, gender, birth_date AS birthDate, address, notes, status, total_spent AS totalSpent, last_visit AS lastVisit, next_appointment AS nextAppointment, created_at AS createdAt, updated_at AS updatedAt FROM patients ORDER BY last_name, first_name"
  );
  return rows;
}

async function getPatient(id) {
  const rows = await query(
    "SELECT id, first_name AS firstName, last_name AS lastName, phone, email, gender, birth_date AS birthDate, address, notes, status, total_spent AS totalSpent, last_visit AS lastVisit, next_appointment AS nextAppointment, created_at AS createdAt, updated_at AS updatedAt FROM patients WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function createPatient(data) {
  const id = data.id || "pat-" + Date.now();
  await query(
    "INSERT INTO patients (id, first_name, last_name, phone, email, gender, birth_date, address, notes, status, total_spent, last_visit, next_appointment) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [id, data.firstName, data.lastName, data.phone, data.email, data.gender, data.birthDate, data.address, data.notes || null, data.status || "actif", data.totalSpent || 0, data.lastVisit || null, data.nextAppointment || null]
  );
  return getPatient(id);
}

async function updatePatient(id, patch) {
  const fields = [];
  const values = [];
  const map = {
    firstName: "first_name", lastName: "last_name", phone: "phone", email: "email",
    gender: "gender", birthDate: "birth_date", address: "address", notes: "notes",
    status: "status", totalSpent: "total_spent", lastVisit: "last_visit",
    nextAppointment: "next_appointment",
  };
  for (const k of Object.keys(patch)) {
    if (map[k]) { fields.push(map[k] + " = ?"); values.push(patch[k]); }
  }
  if (!fields.length) return getPatient(id);
  values.push(id);
  await query("UPDATE patients SET " + fields.join(", ") + " WHERE id = ?", values);
  return getPatient(id);
}

async function deletePatient(id) {
  await query("DELETE FROM patients WHERE id = ?", [id]);
  return true;
}

async function countPatients() {
  const rows = await query("SELECT COUNT(*) AS n FROM patients");
  return rows[0] ? rows[0].n : 0;
}

module.exports = {
  init,
  isAvailable,
  query,
  patients: { list: listPatients, get: getPatient, create: createPatient, update: updatePatient, remove: deletePatient, count: countPatients },
};
