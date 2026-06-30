import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BatteryCharging, Cpu, Zap, Power } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';

export const PowerDocking: React.FC = () => {
  const { drones, toggleDockCharging, autoBalance, toggleAutoBalance } = useApp();

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return '#10B981'; // Green
    if (battery > 20) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getBatteryBg = (battery: number) => {
    if (battery > 50) return 'rgba(16, 185, 129, 0.05)';
    if (battery > 20) return 'rgba(245, 158, 11, 0.05)';
    return 'rgba(239, 68, 68, 0.05)';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <BatteryCharging size={16} color="#8AAEE0" />
          <Text style={styles.headerTitle}>AUTOMATED COUPLING AND LOADOUT</Text>
        </View>

        {/* Dynamic Balancer Card */}
        <GlassCard style={styles.balancerCard}>
          <View style={styles.balancerInfo}>
            <View style={styles.balancerHeader}>
              <Cpu size={14} color="#8AAEE0" />
              <Text style={styles.balancerTitle}>Autonomous Back-up Swap Loop</Text>
            </View>
            <Text style={styles.balancerDesc}>
              Monitors active fleets. Low-battery patrols are automatically routed to inductive plates while standbys launch.
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.btnToggleBalancer, { backgroundColor: autoBalance ? '#395886' : '#111827', borderColor: '#1F2937' }]}
            onPress={toggleAutoBalance}
          >
            <Power size={11} color="#F0F3FA" />
            <Text style={styles.btnToggleBalancerText}>{autoBalance ? 'AUTO RUN' : 'MANUAL'}</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Docks list */}
        <Text style={styles.sectionTitle}>INDUCTIVE COUPLING PORTS</Text>
        <View style={styles.dockGrid}>
          {drones.map(drone => {
            const batteryColor = getBatteryColor(drone.battery);
            const batteryBg = getBatteryBg(drone.battery);
            const canToggleCharge = drone.status === 'docked' || drone.status === 'charging' || drone.status === 'idle';

            return (
              <GlassCard key={drone.id} style={styles.dockCard}>
                <View style={styles.dockHeader}>
                  <View>
                    <Text style={styles.droneId}>{drone.id}</Text>
                    <Text style={styles.dockIdLabel}>{drone.dock_id} • INDUCTIVE PLATE</Text>
                  </View>
                  <StatusBadge status={drone.status} type="drone" />
                </View>

                {/* Battery Meter */}
                <View style={[styles.batteryContainer, { backgroundColor: batteryBg, borderColor: '#1F2937' }]}>
                  <View style={styles.batteryMeta}>
                    <View style={styles.batteryIconRow}>
                      <Zap size={12} color={batteryColor} fill={drone.status === 'charging' ? batteryColor : 'none'} />
                      <Text style={[styles.batteryPercent, { color: batteryColor }]}>{drone.battery}%</Text>
                      {drone.status === 'charging' && (
                        <Text style={styles.chargingRate}>+12.4W</Text>
                      )}
                    </View>
                    <Text style={styles.batteryTemp}>{drone.temp}°C</Text>
                  </View>
                  <View style={styles.batteryBarBg}>
                    <View style={[styles.batteryBarFill, { width: `${drone.battery}%`, backgroundColor: batteryColor }]} />
                  </View>
                </View>

                <Text style={styles.taskText}>TASK: {drone.current_task}</Text>

                {/* Engagement Button */}
                <TouchableOpacity
                  style={[
                    styles.btnCharge,
                    !canToggleCharge && styles.btnChargeDisabled,
                    drone.status === 'charging' && styles.btnChargeActive
                  ]}
                  onPress={() => toggleDockCharging(drone.id)}
                  disabled={!canToggleCharge}
                >
                  <Power size={11} color={drone.status === 'charging' ? '#F0F3FA' : canToggleCharge ? '#10B981' : '#8AAEE0'} />
                  <Text style={[
                    styles.btnChargeText,
                    drone.status === 'charging' && { color: '#F0F3FA' },
                    !canToggleCharge && { color: '#8AAEE0' }
                  ]}>
                    {drone.status === 'charging' ? 'DISENGAGE INDUCTIVE PAD' : canToggleCharge ? 'ENGAGE INDUCTIVE PAD' : 'AIRBORNE PATROL (LOCKED)'}
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#8AAEE0',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  balancerCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#111827',
  },
  balancerInfo: {
    flex: 1,
  },
  balancerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  balancerTitle: {
    color: '#F0F3FA',
    fontSize: 13,
    fontWeight: 'bold',
  },
  balancerDesc: {
    color: '#8AAEE0',
    fontSize: 10.5,
    lineHeight: 14,
  },
  btnToggleBalancer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  btnToggleBalancerText: {
    color: '#F0F3FA',
    fontWeight: 'bold',
    fontSize: 10,
  },
  sectionTitle: {
    color: '#8AAEE0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  dockGrid: {
    gap: 12,
  },
  dockCard: {
    padding: 16,
    gap: 12,
    backgroundColor: '#111827',
  },
  dockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  droneId: {
    color: '#F0F3FA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dockIdLabel: {
    color: '#8AAEE0',
    fontSize: 9.5,
    marginTop: 2,
  },
  batteryContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  batteryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryPercent: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  chargingRate: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  batteryTemp: {
    color: '#8AAEE0',
    fontSize: 9.5,
  },
  batteryBarBg: {
    height: 4,
    backgroundColor: '#0B0F19',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  taskText: {
    color: '#D5DEEF',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  btnCharge: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnChargeActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  btnChargeDisabled: {
    borderColor: '#1F2937',
    backgroundColor: 'transparent',
  },
  btnChargeText: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
});

export default PowerDocking;
