import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Compass, Play, ClipboardList, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';

export const RapidAudit: React.FC = () => {
  const { auditLogs, latestAudit, startSwarmAudit } = useApp();

  const getSystemStatus = () => {
    if (!latestAudit) return { title: 'SWEEP REQUIRED', color: '#F59E0B', desc: 'No rapid audit recorded for this shift. Launch sweep to authorize facility re-entry.' };
    if (latestAudit.status === 'in-progress') return { title: 'SWARM DEPLOYED', color: '#F59E0B', desc: 'Drone agents executing programmatic grid inspections...' };
    if (latestAudit.status === 'completed') return { title: 'FACILITY CLEARED', color: '#10B981', desc: 'Seismic and wind indicators clear. Re-entry authorization GRANTED.' };
    return { title: 'SWEEP FAILED', color: '#EF4444', desc: 'Manual override triggered or drone communications lost.' };
  };

  const status = getSystemStatus();
  
  const checkpoints = latestAudit?.results 
    ? JSON.parse(latestAudit.results) 
    : [
        { name: 'Truss Structural Integrity', status: 'pending', info: 'Evaluating deflection sensors' },
        { name: 'Radiometric Thermal Bays Scan', status: 'pending', info: 'Analyzing forklift charging areas' },
        { name: 'Weld Fault Corrosion Check', status: 'pending', info: 'Scanning high-humidity trusses' },
        { name: 'Secondary Power Grid Dock Checks', status: 'pending', info: 'Verifying inductive pad output' }
      ];

  const triggerSwarmDeploy = () => {
    startSwarmAudit();
  };

  const isScanning = latestAudit?.status === 'in-progress';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Compass size={16} color="#8AAEE0" />
          <Text style={styles.headerTitle}>POST-EVENT SWARM VERIFICATION</Text>
        </View>

        {/* Mission Status Card */}
        <GlassCard style={[styles.statusCard, { borderLeftColor: status.color, borderLeftWidth: 4 }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: status.color }]}>{status.title}</Text>
            {latestAudit && (
              <Text style={styles.progressPct}>{latestAudit.progress}%</Text>
            )}
          </View>
          <Text style={styles.statusDesc}>{status.desc}</Text>
          
          {latestAudit && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${latestAudit.progress}%`, backgroundColor: status.color }]} />
              </View>
            </View>
          )}
        </GlassCard>

        {/* Launch Button */}
        <TouchableOpacity 
          style={[styles.btnDeploy, isScanning && styles.btnDeployDisabled]} 
          onPress={triggerSwarmDeploy}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="#8AAEE0" style={styles.spinner} />
          ) : (
            <Play size={12} color="#0B0F19" fill="#0B0F19" />
          )}
          <Text style={[styles.btnDeployText, isScanning && { color: '#8AAEE0' }]}>
            {isScanning ? 'SWEEP IN PROGRESS...' : 'EXECUTE FLOOD/SEISMIC SWEEP'}
          </Text>
        </TouchableOpacity>

        {/* Checkpoint Matrix */}
        <GlassCard style={styles.matrixCard}>
          <View style={styles.matrixHeader}>
            <ClipboardList size={14} color="#8AAEE0" />
            <Text style={styles.matrixTitle}>Inspection Checklists</Text>
          </View>

          <View style={styles.checklist}>
            {checkpoints.map((item: any, index: number) => (
              <View key={index} style={styles.checkItem}>
                <View style={styles.checkLeft}>
                  <StatusBadge status={item.status} type="audit" />
                  <View style={styles.checkText}>
                    <Text style={styles.checkName}>{item.name}</Text>
                    <Text style={styles.checkInfo}>{item.info}</Text>
                  </View>
                </View>
                {item.status === 'scanning' && (
                  <ActivityIndicator size="small" color="#F59E0B" />
                )}
              </View>
            ))}
          </View>
        </GlassCard>

        {/* History sweeps */}
        <Text style={styles.historyLabel}>ARCHIVED EMERGENCY SWEEPS</Text>

        {auditLogs.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <CheckCircle2 size={18} color="#10B981" />
            <Text style={styles.emptyText}>No emergency safety sweeps logged.</Text>
          </GlassCard>
        ) : (
          auditLogs.map(log => (
            <GlassCard key={log.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                <StatusBadge status={log.status} type="audit" />
              </View>
              <Text style={styles.historyDesc}>
                {log.status === 'completed' 
                  ? `Clearance ${log.clearance_status.toUpperCase()} — Swarm completed routing sweep.` 
                  : `Clearance aborted at ${log.progress}% coverage.`}
              </Text>
            </GlassCard>
          ))
        )}

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
  statusCard: {
    padding: 16,
    backgroundColor: '#111827',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  progressPct: {
    color: '#F0F3FA',
    fontSize: 16,
    fontWeight: '900',
  },
  statusDesc: {
    color: '#D5DEEF',
    fontSize: 11.5,
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#0B0F19',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  btnDeploy: {
    backgroundColor: '#10B981',
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnDeployDisabled: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  btnDeployText: {
    color: '#0B0F19',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  matrixCard: {
    padding: 16,
    backgroundColor: '#111827',
    gap: 12,
  },
  matrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderColor: '#1F2937',
    paddingBottom: 8,
  },
  matrixTitle: {
    color: '#F0F3FA',
    fontSize: 13,
    fontWeight: 'bold',
  },
  checklist: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  checkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkText: {
    flex: 1,
  },
  checkName: {
    color: '#F0F3FA',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  checkInfo: {
    color: '#638ECB',
    fontSize: 9,
    marginTop: 2,
  },
  historyLabel: {
    color: '#8AAEE0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#111827',
    gap: 6,
  },
  emptyText: {
    color: '#8AAEE0',
    fontSize: 11.5,
  },
  historyCard: {
    backgroundColor: '#111827',
    padding: 14,
    gap: 6,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTime: {
    color: '#638ECB',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  historyDesc: {
    color: '#D5DEEF',
    fontSize: 11.5,
  },
  spinner: {
    marginRight: 4,
  },
});

export default RapidAudit;
