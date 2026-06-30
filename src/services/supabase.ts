import { createClient } from '@supabase/supabase-js';

// Read from environment variables if defined, otherwise fall back to a mock URL/Key for local testing
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.mock';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

/**
 * Syncs a structural alert item up to Supabase.
 * If credentials are not set, it acts as a mock sync success and logs to console.
 */
export const syncAlertToSupabase = async (alert: {
  id: string;
  timestamp: number;
  type: string;
  severity: string;
  message: string;
  resolved: number;
}) => {
  try {
    if (SUPABASE_URL.includes('mock-project')) {
      // Mock mode
      console.log(`[Supabase Mock Sync] Upserted alert ${alert.id} to Supabase Cloud`);
      return { success: true, mock: true };
    }

    const { data, error } = await supabase
      .from('alerts')
      .upsert({
        id: alert.id,
        created_at: new Date(alert.timestamp).toISOString(),
        alert_type: alert.type,
        severity: alert.severity,
        message: alert.message,
        resolved: alert.resolved === 1
      });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn(`[Supabase Sync Offline] Alert ${alert.id} cached locally:`, err);
    return { success: false, error: err };
  }
};

/**
 * Syncs a drone's telemetric status up to Supabase.
 */
export const syncDroneToSupabase = async (drone: {
  id: string;
  status: string;
  battery: number;
  current_task: string;
  temp: number;
  dock_id: string;
  is_charging: number;
}) => {
  try {
    if (SUPABASE_URL.includes('mock-project')) {
      return { success: true, mock: true };
    }

    const { data, error } = await supabase
      .from('drones')
      .upsert({
        id: drone.id,
        status: drone.status,
        battery: drone.battery,
        current_task: drone.current_task,
        temp: drone.temp,
        dock_id: drone.dock_id,
        is_charging: drone.is_charging === 1,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Syncs a completed swarm audit log up to Supabase.
 * Covers Feature (4): Post-Seismic/Typhoon Rapid Infrastructure Auditing.
 */
export const syncAuditLogToSupabase = async (log: {
  id: string;
  timestamp: number;
  status: string;
  progress: number;
  event_type: string;
  clearance_status: string;
}) => {
  try {
    if (SUPABASE_URL.includes('mock-project')) {
      console.log(`[Supabase Mock Sync] Upserted audit log ${log.id} — Status: ${log.status}, Clearance: ${log.clearance_status}`);
      return { success: true, mock: true };
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .upsert({
        id: log.id,
        created_at: new Date(log.timestamp).toISOString(),
        status: log.status,
        progress: log.progress,
        event_type: log.event_type,
        clearance_status: log.clearance_status,
      });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn(`[Supabase Sync Offline] Audit log ${log.id} cached locally:`, err);
    return { success: false, error: err };
  }
};

