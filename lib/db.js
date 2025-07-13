import sqlite3 from "better-sqlite3";

// SQLiteデータベースの初期化
const db = new sqlite3("./ticket.db");

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS user_states (
    step BOOLEAN DEFAULT false,
    userId TEXT PRIMARY KEY,
    tickets TEXT,
    number INTEGER,
    name TEXT
  )
`
).run();

// ステートメントを事前に準備
export const insertUserState = db.prepare(
  "INSERT OR REPLACE INTO user_states (userId, tickets) VALUES (?, ?)"
);
export const updateUserState = db.prepare(
  "UPDATE user_states SET number = ?, step = ? WHERE userId = ?"
);
export const selectUserState = db.prepare(
  "SELECT step FROM user_states WHERE userId = ?"
);
export const selectSchedule = db.prepare("SELECT tickets FROM user_states");
export const getTickets = db.prepare(
  "SELECT * FROM user_states WHERE tickets = ?"
);
