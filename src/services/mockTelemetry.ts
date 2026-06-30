import { DroneItem, AlertItem } from '../database/db';

/**
 * Generates minor telemetric updates for active drones and environmental sensors.
 * Triggers alerts if sensor levels exceed nominal safety thresholds.
 */
export const runTelemetryCycle = (
  drones: DroneItem[],
  onUpdateDrone: (updated: DroneItem) => void,
  onNewAlert: (alert: Omit<AlertItem, 'id' | 'timestamp' | 'resolved'>) => void
) => {
  drones.forEach(drone => {
    let nextBattery = drone.battery;
    let nextStatus = drone.status;
    let nextTask = drone.current_task;
    let nextTemp = drone.temp;
    let nextIsCharging = drone.is_charging;

    // 1. Manage battery & task state based on status
    if (drone.status === 'patrolling') {
      // Patroning drains battery
      nextBattery = Math.max(0, drone.battery - Math.floor(Math.random() * 2) - 1);
      
      // Auto-docking transition if battery falls below 20%
      if (nextBattery < 20) {
        nextStatus = 'low-power';
        nextTask = 'Returning to Charging Dock';
      }
      
      // Random temperature variation during flight
      nextTemp = Math.max(25, Math.min(48, drone.temp + (Math.random() > 0.5 ? 1 : -1)));
    } 
    else if (drone.status === 'low-power') {
      // Rapid return
      nextBattery = Math.max(0, drone.battery - 1);
      if (nextBattery <= 15) {
        nextStatus = 'charging';
        nextIsCharging = 1;
        nextTask = 'Docked & Recharging';
      }
    }
    else if (drone.status === 'charging') {
      // Charging increments battery
      nextBattery = Math.min(100, drone.battery + Math.floor(Math.random() * 4) + 2);
      
      // Cool down drone as charging progresses
      if (nextBattery > 80 && nextTemp > 30) {
        nextTemp -= 1;
      }

      if (nextBattery === 100) {
        nextStatus = 'idle';
        nextIsCharging = 0;
        nextTask = 'Standby Mode';
      }
    } 
    else if (drone.status === 'idle' || drone.status === 'docked') {
      // Idle has minimal battery fluctuation
      if (Math.random() > 0.95 && nextBattery > 95) {
        nextBattery -= 1; // minor drain
      }
      // Temperature hovers around ambient (25-30C)
      if (nextTemp > 28) nextTemp -= 1;
      if (nextTemp < 26) nextTemp += 1;
    }

    // Trigger state update
    if (
      nextBattery !== drone.battery ||
      nextStatus !== drone.status ||
      nextTask !== drone.current_task ||
      nextTemp !== drone.temp ||
      nextIsCharging !== drone.is_charging
    ) {
      onUpdateDrone({
        ...drone,
        battery: nextBattery,
        status: nextStatus,
        current_task: nextTask,
        temp: nextTemp,
        is_charging: nextIsCharging
      });
    }
  });

  // 2. Randomly trigger a structural anomaly — Feature (1): Continuous Structural Deflection Analysis
  if (Math.random() > 0.97) {
    const deviation = (10 + Math.random() * 5).toFixed(1); // 10.0mm – 15.0mm deflection
    const isCritical = parseFloat(deviation) > 12.0;
    onNewAlert({
      type: 'deflection',
      severity: isCritical ? 'critical' : 'high',
      message: `Steel Racking Column Sector B3 shows deflection of ${deviation}mm (Safety limit: 12.0mm)`
    });
  }

  // 3. Randomly trigger a thermal hazard anomaly — Feature (2): Radiometric Thermal Fire Patrol
  if (Math.random() > 0.98) {
    const temp = Math.floor(65 + Math.random() * 25); // 65°C – 90°C
    const panels = ['Panel-D4', 'Subpanel-B2', 'Forklift Bay 3', 'Battery Wall East'];
    const panel = panels[Math.floor(Math.random() * panels.length)];
    onNewAlert({
      type: 'thermal',
      severity: temp > 80 ? 'critical' : 'high',
      message: `Radiometric spike at ${panel}: ${temp}°C — Thermal threshold exceeded`
    });
  }

  // 4. Randomly trigger a corrosion/weld defect alert — Feature (3): Visual AI Corrosion Detection
  // Low probability (once every ~200 ticks on average) to simulate CNN passive scan finding
  if (Math.random() > 0.995) {
    const trusses = ['Roof Truss E-12', 'Truss Junction W-04', 'Weld Node B3-NW', 'Column Base Plate C7'];
    const location = trusses[Math.floor(Math.random() * trusses.length)];
    const integrity = Math.floor(55 + Math.random() * 20); // 55–75% integrity remaining
    onNewAlert({
      type: 'corrosion',
      severity: integrity < 65 ? 'high' : 'medium',
      message: `CNN passive scan: Rust oxidation detected at ${location} — Joint integrity at ${integrity}%`
    });
  }
};
