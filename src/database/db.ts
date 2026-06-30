import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export interface AlertItem {
  id: string;
  timestamp: number;
  type: 'deflection' | 'thermal' | 'corrosion' | 'audit'; // 'audit' covers power-balancer and swarm events
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  resolved: number; // 0 = false, 1 = true
}

export interface DroneItem {
  id: string;
  status: 'idle' | 'patrolling' | 'charging' | 'low-power' | 'docked';
  battery: number;
  current_task: string;
  temp: number;
  dock_id: string;
  is_charging: number; // 0 = false, 1 = true
}

export interface AuditLog {
  id: string;
  timestamp: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  results: string; // JSON string of checkpoint statuses
  event_type: 'routine' | 'post-weather' | 'post-seismic'; // What triggered the audit
  clearance_status: 'pending' | 'cleared' | 'compromised'; // Final building re-entry clearance
}

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('safestack.db');
  }
  return db;
};

export const initDB = () => {
  try {
    const database = getDB();
    
    // Create tables
    database.execSync(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        type TEXT,
        severity TEXT,
        message TEXT,
        resolved INTEGER
      );
    `);

    database.execSync(`
      CREATE TABLE IF NOT EXISTS drones (
        id TEXT PRIMARY KEY,
        status TEXT,
        battery INTEGER,
        current_task TEXT,
        temp INTEGER,
        dock_id TEXT,
        is_charging INTEGER
      );
    `);

    database.execSync(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        status TEXT,
        progress INTEGER,
        results TEXT,
        event_type TEXT DEFAULT 'routine',
        clearance_status TEXT DEFAULT 'pending'
      );
    `);

    // Migrate existing audit_logs table if columns are missing (safe no-op if already present)
    try {
      database.execSync(`ALTER TABLE audit_logs ADD COLUMN event_type TEXT DEFAULT 'routine'`);
    } catch (_) {}
    try {
      database.execSync(`ALTER TABLE audit_logs ADD COLUMN clearance_status TEXT DEFAULT 'pending'`);
    } catch (_) {}

    // Seed default drone data if empty
    const droneCheck = database.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM drones');
    if (!droneCheck || droneCheck.count === 0) {
      database.runSync(
        `INSERT INTO drones (id, status, battery, current_task, temp, dock_id, is_charging) VALUES 
        ('Drone-Alpha', 'idle', 95, 'Thermal Hazard Patrol', 34, 'Dock-01', 0),
        ('Drone-Beta', 'patrolling', 65, 'Structural Diagnostics', 32, 'Dock-02', 0),
        ('Drone-Gamma', 'charging', 18, 'Docked & Recharging', 41, 'Dock-03', 1),
        ('Drone-Delta', 'docked', 100, 'Standby Mode', 28, 'Dock-04', 0)`
      );
    }

    // Seed default alerts data if empty
    const alertCheck = database.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM alerts');
    if (!alertCheck || alertCheck.count === 0) {
      database.runSync(
        `INSERT INTO alerts (id, timestamp, type, severity, message, resolved) VALUES 
        ('alert-1', ${Date.now() - 3600000}, 'thermal', 'medium', 'Hotspot detected at Forklift Charging Bay 2 (48°C)', 0),
        ('alert-2', ${Date.now() - 7200000}, 'deflection', 'low', 'Racking Section B3 column deviation at 4.2mm', 1),
        ('alert-3', ${Date.now() - 10800000}, 'corrosion', 'high', 'Corrosion rust spots detected on Roof Truss Sector E', 0)`
      );
    }

    console.log("SafeStack Database Initialized Successfully");
  } catch (error) {
    console.error("Failed to initialize database", error);
  }
};

// CRUD Helpers
export const fetchAlerts = (): AlertItem[] => {
  try {
    const database = getDB();
    return database.getAllSync<AlertItem>('SELECT * FROM alerts ORDER BY timestamp DESC');
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const insertAlert = (alert: Omit<AlertItem, 'id' | 'timestamp' | 'resolved'>) => {
  try {
    const database = getDB();
    const id = 'alert-' + Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    database.runSync(
      'INSERT INTO alerts (id, timestamp, type, severity, message, resolved) VALUES (?, ?, ?, ?, ?, 0)',
      [id, timestamp, alert.type, alert.severity, alert.message]
    );
    return { id, timestamp, ...alert, resolved: 0 };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const resolveAlertInDB = (id: string) => {
  try {
    const database = getDB();
    database.runSync('UPDATE alerts SET resolved = 1 WHERE id = ?', [id]);
  } catch (e) {
    console.error(e);
  }
};

export const fetchDrones = (): DroneItem[] => {
  try {
    const database = getDB();
    return database.getAllSync<DroneItem>('SELECT * FROM drones');
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const updateDroneInDB = (drone: DroneItem) => {
  try {
    const database = getDB();
    database.runSync(
      'UPDATE drones SET status = ?, battery = ?, current_task = ?, temp = ?, dock_id = ?, is_charging = ? WHERE id = ?',
      [drone.status, drone.battery, drone.current_task, drone.temp, drone.dock_id, drone.is_charging, drone.id]
    );
  } catch (e) {
    console.error(e);
  }
};

export const fetchAuditLogs = (): AuditLog[] => {
  try {
    const database = getDB();
    return database.getAllSync<AuditLog>('SELECT * FROM audit_logs ORDER BY timestamp DESC');
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const insertAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  try {
    const database = getDB();
    const id = 'audit-' + Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    database.runSync(
      'INSERT INTO audit_logs (id, timestamp, status, progress, results, event_type, clearance_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, timestamp, log.status, log.progress, log.results, log.event_type ?? 'routine', log.clearance_status ?? 'pending']
    );
    return { id, timestamp, ...log };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const updateAuditLogStatus = (
  id: string,
  status: string,
  progress: number,
  results: string,
  clearance_status?: string
) => {
  try {
    const database = getDB();
    if (clearance_status) {
      database.runSync(
        'UPDATE audit_logs SET status = ?, progress = ?, results = ?, clearance_status = ? WHERE id = ?',
        [status, progress, results, clearance_status, id]
      );
    } else {
      database.runSync(
        'UPDATE audit_logs SET status = ?, progress = ?, results = ? WHERE id = ?',
        [status, progress, results, id]
      );
    }
  } catch (e) {
    console.error(e);
  }
};
