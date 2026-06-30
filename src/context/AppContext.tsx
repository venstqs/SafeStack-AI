import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  initDB, 
  fetchAlerts, 
  fetchDrones, 
  fetchAuditLogs,
  insertAlert,
  resolveAlertInDB,
  updateDroneInDB,
  insertAuditLog,
  updateAuditLogStatus,
  DroneItem,
  AlertItem,
  AuditLog
} from '../database/db';
import { syncAlertToSupabase, syncDroneToSupabase, syncAuditLogToSupabase } from '../services/supabase';
import { runTelemetryCycle } from '../services/mockTelemetry';

interface AppContextType {
  drones: DroneItem[];
  alerts: AlertItem[];
  auditLogs: AuditLog[];
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isSyncing: boolean;
  autoBalance: boolean;
  toggleAutoBalance: () => void;
  resolveAlert: (id: string) => void;
  triggerManualAlert: (type: 'deflection' | 'thermal' | 'corrosion' | 'audit', severity: string, message: string) => void;
  toggleDockCharging: (droneId: string) => void;
  startSwarmAudit: () => void;
  latestAudit: AuditLog | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drones, setDrones] = useState<DroneItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [autoBalance, setAutoBalance] = useState<boolean>(true);
  const [latestAudit, setLatestAudit] = useState<AuditLog | null>(null);
  
  const swarmInterval = useRef<any>(null);

  // Initialize DB and load caches
  useEffect(() => {
    initDB();
    reloadCaches();
  }, []);

  const reloadCaches = () => {
    const cachedAlerts = fetchAlerts();
    const cachedDrones = fetchDrones();
    const cachedAudits = fetchAuditLogs();
    
    setAlerts(cachedAlerts);
    setDrones(cachedDrones);
    setAuditLogs(cachedAudits);
    if (cachedAudits.length > 0) {
      setLatestAudit(cachedAudits[0]);
    }
  };

  // Run telemetry cycle ticks
  useEffect(() => {
    const timer = setInterval(() => {
      // Create copy of current drones to evaluate telemetry changes
      let currentDrones = fetchDrones();
      
      // Auto-balancing implementation
      if (autoBalance) {
        const lowPowerPatroller = currentDrones.find(
          d => d.status === 'patrolling' && d.battery < 25
        );
        const highPowerBackup = currentDrones.find(
          d => (d.status === 'idle' || d.status === 'docked') && d.battery > 85
        );

        if (lowPowerPatroller && highPowerBackup) {
          // Launch the backup
          const nextBackup: DroneItem = {
            ...highPowerBackup,
            status: 'patrolling',
            current_task: 'Relieving low battery patrol',
            is_charging: 0
          };
          updateDroneInDB(nextBackup);
          syncDroneToSupabase(nextBackup);

          // Route the low power to dock
          const nextPatroller: DroneItem = {
            ...lowPowerPatroller,
            status: 'low-power',
            current_task: 'Low battery - Auto-docking',
            is_charging: 0
          };
          updateDroneInDB(nextPatroller);
          syncDroneToSupabase(nextPatroller);

          insertAlert({
            type: 'audit',
            severity: 'medium',
            message: `Power Balancer: ${highPowerBackup.id} launched to relieve low battery drone ${lowPowerPatroller.id}`
          });
          
          // Re-fetch to ensure telemetry tick evaluates correct state
          currentDrones = fetchDrones();
        }
      }

      runTelemetryCycle(
        currentDrones,
        (updatedDrone) => {
          updateDroneInDB(updatedDrone);
          syncDroneToSupabase(updatedDrone);
        },
        (newAlert) => {
          const inserted = insertAlert(newAlert);
          if (inserted) {
            syncAlertToSupabase(inserted);
          }
        }
      );

      // Refresh frontend state from SQLite Cache
      reloadCaches();
    }, 4000);

    return () => clearInterval(timer);
  }, [autoBalance]);

  const toggleAutoBalance = () => {
    setAutoBalance(!autoBalance);
  };

  const resolveAlert = (id: string) => {
    resolveAlertInDB(id);
    
    // Attempt Supabase Sync
    setIsSyncing(true);
    const databaseAlert = fetchAlerts().find(a => a.id === id);
    if (databaseAlert) {
      syncAlertToSupabase(databaseAlert).finally(() => {
        setIsSyncing(false);
        reloadCaches();
      });
    } else {
      setIsSyncing(false);
      reloadCaches();
    }
  };

  const triggerManualAlert = (type: 'deflection' | 'thermal' | 'corrosion' | 'audit', severity: string, message: string) => {
    const inserted = insertAlert({ type, severity: severity as any, message });
    if (inserted) {
      syncAlertToSupabase(inserted);
    }
    reloadCaches();
  };

  const toggleDockCharging = (droneId: string) => {
    const targetDrone = drones.find(d => d.id === droneId);
    if (targetDrone) {
      let nextStatus = targetDrone.status;
      let nextCharging = targetDrone.is_charging;
      let nextTask = targetDrone.current_task;

      if (targetDrone.status === 'charging') {
        nextStatus = 'docked';
        nextCharging = 0;
        nextTask = 'Standby Mode';
      } else if (targetDrone.status === 'docked' || targetDrone.status === 'idle') {
        nextStatus = 'charging';
        nextCharging = 1;
        nextTask = 'Docked & Recharging';
      } else {
        // Drone is in the air, cannot charge
        return;
      }

      const updated = {
        ...targetDrone,
        status: nextStatus as any,
        is_charging: nextCharging,
        current_task: nextTask
      };

      updateDroneInDB(updated);
      syncDroneToSupabase(updated);
      reloadCaches();
    }
  };

  const startSwarmAudit = () => {
    // 1. Create in-progress audit
    const checkpoints = [
      { name: 'Truss Structural Integrity', status: 'scanning', info: 'Evaluating deflection sensors' },
      { name: 'Radiometric Thermal Bays Scan', status: 'pending', info: 'Analyzing forklift charging areas' },
      { name: 'Weld Fault Corrosion Check', status: 'pending', info: 'Scanning high-humidity trusses' },
      { name: 'Secondary Power Grid Dock Checks', status: 'pending', info: 'Verifying inductive pad output' }
    ];

    const newLog = insertAuditLog({
      status: 'in-progress',
      progress: 0,
      results: JSON.stringify(checkpoints),
      event_type: 'post-weather',    // Feature (4): Post-Typhoon/Seismic Rapid Auditing
      clearance_status: 'pending'
    });

    if (!newLog) return;
    reloadCaches();

    let step = 0;
    if (swarmInterval.current) clearInterval(swarmInterval.current);

    swarmInterval.current = setInterval(() => {
      step += 1;
      const progressPercent = Math.min(100, step * 25);
      const currentCheckpoints = [...checkpoints];

      // Update checkpoint statuses based on progress percent
      if (progressPercent >= 25) {
        currentCheckpoints[0].status = 'completed';
        if (progressPercent < 50) currentCheckpoints[1].status = 'scanning';
      }
      if (progressPercent >= 50) {
        currentCheckpoints[1].status = 'completed';
        if (progressPercent < 75) currentCheckpoints[2].status = 'scanning';
      }
      if (progressPercent >= 75) {
        currentCheckpoints[2].status = 'completed';
        if (progressPercent < 100) currentCheckpoints[3].status = 'scanning';
      }
      if (progressPercent === 100) {
        currentCheckpoints[3].status = 'completed';
      }

      const isDone = progressPercent === 100;
      const finalStatus = isDone ? 'completed' : 'in-progress';
      const finalClearance = isDone ? 'cleared' : 'pending';

      updateAuditLogStatus(
        newLog.id,
        finalStatus,
        progressPercent,
        JSON.stringify(currentCheckpoints),
        finalClearance
      );

      // If completed, trigger system log alert + cloud sync
      if (isDone) {
        insertAlert({
          type: 'audit',
          severity: 'low',
          message: `Swarm Audit Completed: All 4 major sectors cleared. Building SAFE for re-entry.`
        });
        // Sync the final cleared audit record to Supabase
        syncAuditLogToSupabase({
          id: newLog.id,
          timestamp: newLog.timestamp,
          status: 'completed',
          progress: 100,
          event_type: 'post-weather',
          clearance_status: 'cleared'
        });
        if (swarmInterval.current) clearInterval(swarmInterval.current);
      }

      reloadCaches();
    }, 2000);
  };

  return (
    <AppContext.Provider
      value={{
        drones,
        alerts,
        auditLogs,
        activeScreen,
        setActiveScreen,
        isSyncing,
        autoBalance,
        toggleAutoBalance,
        resolveAlert,
        triggerManualAlert,
        toggleDockCharging,
        startSwarmAudit,
        latestAudit
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
