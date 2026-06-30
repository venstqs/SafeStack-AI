import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Layers, AlertTriangle, ShieldCheck, Play, HardHat } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { TelemetryGraph } from '../components/TelemetryGraph';
import { StatusBadge } from '../components/StatusBadge';

export const Structural: React.FC = () => {
  const { alerts, triggerManualAlert, resolveAlert } = useApp();
  const [liveDeflection, setLiveDeflection] = useState<number>(3.4);

  const structuralAlerts = alerts.filter(a => a.type === 'deflection');
  const activeDeflections = structuralAlerts.filter(a => a.resolved === 0);

  // Dynamic nominal deflection updates
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeDeflections.length === 0) {
        setLiveDeflection(parseFloat((2.8 + Math.random() * 1.6).toFixed(1)));
      } else {
        const maxVal = activeDeflections.reduce((max, alert) => {
          const match = alert.message.match(/deflection of (\d+(\.\d+)?)mm/);
          if (match) {
            const val = parseFloat(match[1]);
            return val > max ? val : max;
          }
          return max;
        }, 12.8);
        setLiveDeflection(maxVal);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [activeDeflections]);

  const simulateDeflectionFailure = () => {
    const deviation = parseFloat((12.4 + Math.random() * 2.8).toFixed(1));
    triggerManualAlert(
      'deflection',
      'critical',
      `Steel Racking Column Sector B3 shows deflection of ${deviation}mm (Safety limit: 12.0mm)`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Title */}
        <View style={styles.header}>
          <Layers size={14} color="#8AAEE0" />
          <Text style={styles.headerTitle}>RACKING DIAGNOSTIC INTERFACE</Text>
        </View>

        {/* Live Profile Graph */}
        <View style={styles.graphSection}>
          <View style={styles.graphHeader}>
            <View>
              <Text style={styles.graphSubText}>SECTOR B3 RADAR STATUS</Text>
              <Text style={styles.graphTitle}>Real-time Deflection Profile</Text>
            </View>
            <StatusBadge status={liveDeflection > 12.0 ? 'overload' : 'nominal'} type="audit" />
          </View>

          <TelemetryGraph mode="rack" data={liveDeflection} />
          
          <View style={styles.matrixCard}>
            <View style={styles.matrixRow}>
              <View style={styles.matrixBox}>
                <Text style={styles.matrixVal}>{liveDeflection} mm</Text>
                <Text style={styles.matrixLbl}>CURRENT DEV</Text>
              </View>
              <View style={styles.matrixDivider} />
              <View style={styles.matrixBox}>
                <Text style={styles.matrixVal}>12.0 mm</Text>
                <Text style={styles.matrixLbl}>MAX THRESHOLD</Text>
              </View>
              <View style={styles.matrixDivider} />
              <View style={styles.matrixBox}>
                <Text style={[styles.matrixVal, { color: '#10B981' }]}>99.4%</Text>
                <Text style={styles.matrixLbl}>STABILITY RATIO</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Calibration Console */}
        <View style={styles.calCard}>
          <View style={styles.calHeader}>
            <HardHat size={14} color="#F59E0B" />
            <Text style={styles.calTitle}>Diagnostic Deflection Injection</Text>
          </View>
          <Text style={styles.calDesc}>
            Trigger deflection warnings manually to verify real-time alerts.
          </Text>
          <TouchableOpacity style={styles.btnCalibrate} onPress={simulateDeflectionFailure}>
            <Play size={12} color="#07080A" fill="#07080A" />
            <Text style={styles.btnCalibrateText}>INJECT DEVIATION</Text>
          </TouchableOpacity>
        </View>

        {/* Logs */}
        <Text style={styles.logLabel}>INCIDENT SHEETS</Text>
        
        {structuralAlerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <ShieldCheck size={18} color="#10B981" />
            <Text style={styles.emptyText}>All stress registers within safe limits.</Text>
          </View>
        ) : (
          structuralAlerts.map(alert => (
            <View key={alert.id} style={[styles.logCard, { borderLeftColor: alert.resolved ? '#10B981' : '#EF4444' }]}>
              <View style={styles.logHeaderRow}>
                <Text style={styles.logTime}>{new Date(alert.timestamp).toLocaleTimeString()}</Text>
                <StatusBadge status={alert.resolved ? 'RESOLVED' : 'UNRESOLVED'} type="audit" />
              </View>
              <Text style={styles.logMsg}>{alert.message}</Text>
              {!alert.resolved && (
                <TouchableOpacity 
                  style={styles.btnResolve}
                  onPress={() => resolveAlert(alert.id)}
                >
                  <Text style={styles.btnResolveText}>DISPATCH CLEARANCE</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080A',
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
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  graphSection: {
    backgroundColor: '#0E1117',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#171923',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphSubText: {
    color: '#638ECB',
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  graphTitle: {
    color: '#F0F3FA',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  matrixCard: {
    marginTop: 12,
    backgroundColor: '#07080A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#171923',
    padding: 12,
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matrixBox: {
    flex: 1,
    alignItems: 'center',
  },
  matrixVal: {
    color: '#F0F3FA',
    fontSize: 13.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  matrixLbl: {
    color: '#638ECB',
    fontSize: 7.5,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  matrixDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#171923',
  },
  calCard: {
    backgroundColor: '#0E1117',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#171923',
    gap: 10,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calTitle: {
    color: '#F0F3FA',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  calDesc: {
    color: '#8AAEE0',
    fontSize: 10.5,
    lineHeight: 14,
  },
  btnCalibrate: {
    backgroundColor: '#F59E0B',
    height: 38,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  btnCalibrateText: {
    color: '#07080A',
    fontWeight: '900',
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  logLabel: {
    color: '#8AAEE0',
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#0E1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#171923',
    gap: 6,
  },
  emptyText: {
    color: '#8AAEE0',
    fontSize: 11,
  },
  logCard: {
    backgroundColor: '#0E1117',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#171923',
    borderLeftWidth: 3.5,
    gap: 8,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTime: {
    color: '#638ECB',
    fontSize: 9.5,
    fontFamily: 'monospace',
  },
  logMsg: {
    color: '#F0F3FA',
    fontSize: 12.5,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  btnResolve: {
    backgroundColor: 'transparent',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  btnResolveText: {
    color: '#EF4444',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});

export default Structural;
