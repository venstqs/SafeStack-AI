import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Flame, ShieldCheck, Camera, Eye, Sparkles } from 'lucide-react-native';
import Svg, { Rect, G, Line, Text as SvgText, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';

export const VisionAI: React.FC = () => {
  const { alerts, triggerManualAlert, resolveAlert } = useApp();
  const [subTab, setSubTab] = useState<'thermal' | 'corrosion'>('thermal');
  
  // 1. Thermal State
  const [thermalGrid, setThermalGrid] = useState<number[]>([32, 28, 41, 35, 30, 27, 34, 38, 29]);
  const thermalAlerts = alerts.filter(a => a.type === 'thermal');
  const activeThermal = thermalAlerts.filter(a => a.resolved === 0);

  // 2. Corrosion State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<'idle' | 'nominal' | 'defect'>('idle');
  const [defectDetails, setDefectDetails] = useState<{ severity: string; integrity: number } | null>(null);
  const corrosionAlerts = alerts.filter(a => a.type === 'corrosion');

  // Dynamic temperature fluctuations for thermal grid
  useEffect(() => {
    const timer = setInterval(() => {
      setThermalGrid(prev => {
        return prev.map((t, idx) => {
          if (idx === 2 && activeThermal.length > 0) {
            return Math.floor(75 + Math.random() * 8); // Hold bays hot during active warnings
          }
          const drift = Math.random() > 0.5 ? 1 : -1;
          const nominalBaseline = idx === 2 ? 40 : 28;
          return Math.max(22, Math.min(55, t + drift));
        });
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [activeThermal]);

  const simulateThermalSpike = () => {
    const temp = Math.floor(76 + Math.random() * 14);
    triggerManualAlert(
      'thermal',
      'high',
      `Radiometric sensor spike at Forklift Charging Bay 2 (${temp}°C)`
    );
  };

  const runCnnScan = () => {
    setIsScanning(true);
    setScanResult('idle');
    setTimeout(() => {
      setIsScanning(false);
      const isRustFound = Math.random() > 0.35;
      if (isRustFound) {
        setScanResult('defect');
        const integrity = Math.floor(65 + Math.random() * 15);
        setDefectDetails({ severity: 'high', integrity });
        triggerManualAlert(
          'corrosion',
          'high',
          `CNN Rust Detection: Weld joint W-104 on roof Truss Sect E-12 structural integrity at ${integrity}%`
        );
      } else {
        setScanResult('nominal');
        setDefectDetails(null);
      }
    }, 2000);
  };

  const zones = [
    'Subpanel D4', 'Electrical Box A', 'Forklift Bay 2',
    'Main Battery 1', 'Main Switchboard', 'Compressor Bay',
    'Boiler Outlet', 'HVAC Trunk E', 'Capacitor Bank'
  ];

  return (
    <View style={styles.container}>
      {/* Selector Switch */}
      <View style={styles.selectorContainer}>
        <View style={styles.selectorBg}>
          <TouchableOpacity 
            style={[styles.selectorButton, subTab === 'thermal' && styles.selectorActive]} 
            onPress={() => setSubTab('thermal')}
          >
            <Flame size={12} color={subTab === 'thermal' ? '#F0F3FA' : '#8AAEE0'} />
            <Text style={[styles.selectorText, subTab === 'thermal' && styles.selectorTextActive]}>FLIR INFRARED</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectorButton, subTab === 'corrosion' && styles.selectorActive]} 
            onPress={() => setSubTab('corrosion')}
          >
            <Camera size={12} color={subTab === 'corrosion' ? '#F0F3FA' : '#8AAEE0'} />
            <Text style={[styles.selectorText, subTab === 'corrosion' && styles.selectorTextActive]}>CNN WELD DISPATCH</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {subTab === 'thermal' ? (
          /* THERMAL SECTION */
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eye size={14} color="#8AAEE0" />
              <Text style={styles.sectionTitle}>MULTISPECTRAL INFRARED GRID</Text>
            </View>

            <View style={styles.mainCard}>
              <View style={styles.flirGrid}>
                {thermalGrid.map((temp, index) => {
                  let cellBg = '#07080A';
                  let strokeColor = '#171923';
                  let tempColor = '#F0F3FA';

                  if (temp > 70) {
                    cellBg = 'rgba(239, 68, 68, 0.08)';
                    strokeColor = '#EF4444';
                    tempColor = '#EF4444';
                  } else if (temp > 40) {
                    cellBg = 'rgba(245, 158, 11, 0.08)';
                    strokeColor = '#F59E0B';
                    tempColor = '#F59E0B';
                  }

                  return (
                    <View key={index} style={[styles.flirCell, { backgroundColor: cellBg, borderColor: strokeColor }]}>
                      <Text style={styles.flirZone}>{zones[index]}</Text>
                      <Text style={[styles.flirTemp, { color: tempColor }]}>{temp}°C</Text>
                      <View style={styles.flirFooter}>
                        <Text style={[styles.flirStatusText, { color: strokeColor }]}>
                          {temp > 70 ? 'CRIT' : temp > 40 ? 'SPIKE' : 'STBL'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.controlCard}>
              <Text style={styles.desc}>
                Radiometric diagnostics scan for structural overheating in unlit electrical distribution subpanels.
              </Text>
              <TouchableOpacity style={styles.btnAction} onPress={simulateThermalSpike}>
                <Flame size={12} color="#07080A" />
                <Text style={styles.btnActionText}>SIMULATE PANELS EXCURSION</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.logLabel}>INFRARED INCIDENT ARCHIVE</Text>
            {thermalAlerts.length === 0 ? (
              <View style={styles.emptyCard}>
                <ShieldCheck size={18} color="#10B981" />
                <Text style={styles.emptyText}>All sectors stable. No radiometric warnings active.</Text>
              </View>
            ) : (
              thermalAlerts.map(alert => (
                <View key={alert.id} style={[styles.logCard, { borderLeftColor: alert.resolved ? '#10B981' : '#EF4444' }]}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logTime}>{new Date(alert.timestamp).toLocaleTimeString()}</Text>
                    <StatusBadge status={alert.resolved ? 'RESOLVED' : 'ACTIVE'} type="audit" />
                  </View>
                  <Text style={styles.logMsg}>{alert.message}</Text>
                  {!alert.resolved && (
                    <TouchableOpacity style={styles.btnResolveInline} onPress={() => resolveAlert(alert.id)}>
                      <Text style={styles.btnResolveInlineText}>CLEAR ALARM INDEX</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          /* CORROSION / CNN SECTION */
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Camera size={14} color="#8AAEE0" />
              <Text style={styles.sectionTitle}>CNN Weld Viewport HUD</Text>
            </View>

            <View style={styles.mainCard}>
              <View style={styles.viewportWrapper}>
                <Svg width="100%" height="160">
                  {/* Viewport Boundary */}
                  <Rect x={2} y={2} width="99%" height="156" rx={4} fill="#05070B" stroke="#171923" strokeWidth={1} />
                  
                  {/* HUD target ticks */}
                  <Line x1={20} y1={20} x2={30} y2={20} stroke="#8AAEE0" strokeWidth={1} />
                  <Line x1={20} y1={20} x2={20} y2={30} stroke="#8AAEE0" strokeWidth={1} />
                  
                  <Line x1={290} y1={20} x2={280} y2={20} stroke="#8AAEE0" strokeWidth={1} />
                  <Line x1={290} y1={20} x2={290} y2={30} stroke="#8AAEE0" strokeWidth={1} />

                  {/* Steel Truss design line elements */}
                  <Line x1={40} y1={110} x2={280} y2={110} stroke="#171923" strokeWidth={12} />
                  <Line x1={90} y1={30} x2={90} y2={110} stroke="#171923" strokeWidth={8} />
                  <Line x1={230} y1={30} x2={230} y2={110} stroke="#171923" strokeWidth={8} />
                  
                  {/* Weld joint node */}
                  <Circle cx={230} cy={110} r={10} fill="rgba(99, 116, 139, 0.15)" stroke="#2D3748" strokeWidth={1} />

                  {isScanning && (
                    <G>
                      {/* Animated scan indicator */}
                      <Line x1={10} y1={80} x2={300} y2={80} stroke="#8AAEE0" strokeWidth={1} />
                      <Rect x={10} y={10} width="93%" height="140" fill="rgba(138, 174, 224, 0.01)" stroke="#8AAEE0" strokeWidth={0.5} strokeDasharray="3 3" rx={2} />
                    </G>
                  )}

                  {scanResult === 'defect' && (
                    <G>
                      <Rect x={215} y={95} width="30" height="30" fill="rgba(239, 68, 68, 0.1)" stroke="#EF4444" strokeWidth={1} rx={2} />
                      <SvgText x={145} y={90} fill="#EF4444" fontSize="8" fontWeight="bold" fontFamily="monospace">FAULT: JOINT W-104</SvgText>
                    </G>
                  )}

                  {scanResult === 'nominal' && (
                    <G>
                      <Rect x={10} y={10} width="93%" height="140" fill="rgba(16, 185, 129, 0.01)" stroke="#10B981" strokeWidth={1} rx={2} />
                      <SvgText x={30} y={30} fill="#10B981" fontSize="8.5" fontWeight="bold" fontFamily="monospace">CNN REPORT: JOINT NOMINAL</SvgText>
                    </G>
                  )}
                </Svg>

                {isScanning && (
                  <View style={styles.scanningBackdrop}>
                    <ActivityIndicator size="small" color="#F0F3FA" />
                    <Text style={styles.scanningText}>CNN SCANNING ENGINE RUNNING</Text>
                  </View>
                )}
              </View>

              <View style={styles.hudMetaRow}>
                <View style={styles.hudMetaCol}>
                  <Text style={styles.hudMetaVal}>{isScanning ? 'RUNNING' : scanResult === 'defect' ? 'FAULT' : scanResult === 'nominal' ? 'CLEAR' : 'STANDBY'}</Text>
                  <Text style={styles.hudMetaLbl}>STATE</Text>
                </View>
                <View style={styles.hudMetaDivider} />
                <View style={styles.hudMetaCol}>
                  <Text style={styles.hudMetaVal}>ResNet-50</Text>
                  <Text style={styles.hudMetaLbl}>BACKBONE</Text>
                </View>
                <View style={styles.hudMetaDivider} />
                <View style={styles.hudMetaCol}>
                  <Text style={styles.hudMetaVal}>{defectDetails ? `${defectDetails.integrity}%` : '100%'}</Text>
                  <Text style={styles.hudMetaLbl}>INTEGRITY</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.btnActionScan} onPress={runCnnScan} disabled={isScanning}>
                <Sparkles size={12} color="#07080A" />
                <Text style={styles.btnActionScanText}>START VOLUMETRIC SCAN</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.logLabel}>WELD DIAGNOSTIC ENTRIES</Text>
            {corrosionAlerts.length === 0 ? (
              <View style={styles.emptyCard}>
                <ShieldCheck size={18} color="#10B981" />
                <Text style={styles.emptyText}>All welds nominal. No rust oxidation logged.</Text>
              </View>
            ) : (
              corrosionAlerts.map(alert => (
                <View key={alert.id} style={[styles.logCard, { borderLeftColor: alert.resolved ? '#10B981' : '#EF4444' }]}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logTime}>{new Date(alert.timestamp).toLocaleTimeString()}</Text>
                    <StatusBadge status={alert.resolved ? 'RESOLVED' : 'ACTIVE'} type="audit" />
                  </View>
                  <Text style={styles.logMsg}>{alert.message}</Text>
                  {!alert.resolved && (
                    <TouchableOpacity style={styles.btnResolveInline} onPress={() => resolveAlert(alert.id)}>
                      <Text style={styles.btnResolveInlineText}>CLEAR WELD INCIDENT</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
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
  selectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#07080A',
  },
  selectorBg: {
    flexDirection: 'row',
    backgroundColor: '#0E1117',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#171923',
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  selectorActive: {
    backgroundColor: '#395886',
  },
  selectorText: {
    color: '#8AAEE0',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  selectorTextActive: {
    color: '#F0F3FA',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#8AAEE0',
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  mainCard: {
    padding: 14,
    backgroundColor: '#0E1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#171923',
  },
  flirGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  flirCell: {
    width: '31%',
    aspectRatio: 0.95,
    borderRadius: 6,
    borderWidth: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  flirZone: {
    color: '#D5DEEF',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  flirTemp: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginVertical: 2,
  },
  flirFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flirStatusText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  controlCard: {
    padding: 14,
    backgroundColor: '#0E1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#171923',
    gap: 12,
  },
  desc: {
    color: '#8AAEE0',
    fontSize: 10.5,
    lineHeight: 15,
  },
  btnAction: {
    backgroundColor: '#EF4444',
    height: 38,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnActionText: {
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
  logHeader: {
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
  btnResolveInline: {
    backgroundColor: 'transparent',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  btnResolveInlineText: {
    color: '#EF4444',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  viewportWrapper: {
    height: 160,
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
  },
  scanningBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 7, 11, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanningText: {
    color: '#F0F3FA',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  hudMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#05070B',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#171923',
    marginTop: 12,
  },
  hudMetaCol: {
    alignItems: 'center',
    flex: 1,
  },
  hudMetaVal: {
    color: '#F0F3FA',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  hudMetaLbl: {
    color: '#638ECB',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  hudMetaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#171923',
  },
  btnActionScan: {
    backgroundColor: '#8AAEE0',
    height: 38,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  btnActionScanText: {
    color: '#07080A',
    fontWeight: '900',
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
});

export default VisionAI;
