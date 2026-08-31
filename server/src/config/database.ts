import initSqlJs, { type Database } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.resolve(__dirname, '../../data/fanta.db');

let db: Database;

export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs();

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing DB or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('📦 Database loaded from', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('📦 Creating new database');
  }

  // Enable WAL mode and foreign keys
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');

  return db;
}

export function getDb(): Database {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// Auto-save to disk
export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Save periodically (every 5 seconds if there are changes)
let saveTimer: ReturnType<typeof setInterval> | null = null;
let dirty = false;

export function markDirty(): void {
  dirty = true;
}

export function startAutoSave(): void {
  if (saveTimer) return;
  saveTimer = setInterval(() => {
    if (dirty) {
      saveDatabase();
      dirty = false;
    }
  }, 5000);
}

// Helper: run a query and return all rows
export function queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push(row);
  }
  stmt.free();
  return rows;
}

// Helper: run a query and return first row
export function queryOne(sql: string, params: unknown[] = []): Record<string, unknown> | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: run an insert/update/delete and return changes
export function run(sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number } {
  db.run(sql, params);
  markDirty();
  const changes = db.getRowsModified();
  const lastRow = queryOne('SELECT last_insert_rowid() as id');
  return { changes, lastInsertRowid: lastRow ? Number(lastRow.id) : 0 };
}
