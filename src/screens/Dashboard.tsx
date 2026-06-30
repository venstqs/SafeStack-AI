import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useWindowDimensions } from 'react-native';
import { Shield, Battery, Signal, Radio, Terminal, ChevronRight, Compass } from 'lucide-react-native';
import Svg, { Rect, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { AlertModal } from '../components/AlertModal';
import { AlertItem } from '../database/db';

export const Dashboard: React.FC = () => {
  const { 
    drones, 
    alerts, 
    autoBalance, 
    toggleAutoBalance, 
    resolveAlert 
  } = useApp();

  const { width: screenWidth } = useWindowDimensions();
  const mapWidth = screenWidth - 32;

  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [mapPulse, setMapPulse] = useState<number>(1);

  const unresolvedAlerts = alerts.filter(a => a.resolved === 0);
  const criticalCount = unresolvedAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  
  const systemStatus = criticalCount > 0 
    ? { title: 'SECTOR ANOMALY', color: '#EF4444', label: 'CRITICAL' }
    : unresolvedAlerts.length > 0 
      ? { title: 'TELEMETRY FLAGGED', color: '#F59E0B', label: 'WARNING' }
      : { title: 'ALL SECTORS CLEAR', color: '#10B981', label: 'NOMINAL' };

  // Map scanner animation pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setMapPulse(p => (p === 1 ? 1.5 : 1));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleOpenAlert = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Obsidian Telemetry Ribbon */}
        <View style={styles.hudRibbon}>
          <View style={styles.hudPill}>
            <Radio size={12} color="#638ECB" />
            <Text style={styles.hudMonoText}>RC LINK: 98%</Text>
          </View>
          <View style={styles.hudPill}>
            <Signal size={12} color="#638ECB" />
            <Text style={styles.hudMonoText}>GPS: 16 SATS</Text>
          </View>
          <View style={styles.hudPill}>
            <Compass size={12} color="#638ECB" />
            <Text style={styles.hudMonoText}>SWARM: D-0{drones.length}</Text>
          </View>
        </View>

        {/* Live Vector Blueprint Map */}
        <View style={styles.mapContainer}>
          <Text style={styles.mapHeading}>LIVE PATROL VECTOR MAP</Text>
          <Svg width={mapWidth} height={140}>
            {/* Warehouse outer grid */}
            <Rect x={1} y={1} width={mapWidth - 2} height={138} fill="#090D16" stroke="#1F2937" strokeWidth={1} rx={4} />
            
            {/* Structural aisles grid representation */}
            <Rect x={20} y={20} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />
            <Rect x={100} y={20} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />
            <Rect x={180} y={20} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />
            <Rect x={260} y={20} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />
            
            <Rect x={20} y={80} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />
            <Rect x={100} y={80} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />
            <Rect x={180} y={80} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />
            <Rect x={260} y={80} width={60} height={40} fill="rgba(99, 116, 139, 0.05)" stroke="#1F2937" strokeWidth={1} rx={2} />

            {/* Warehouse labels */}
            <SvgText x={30} y={45} fill="#638ECB" fontSize="8" fontWeight="bold">ZONE A</SvgText>
            <SvgText x={110} y={45} fill="#638ECB" fontSize="8" fontWeight="bold">ZONE B</SvgText>
            <SvgText x={190} y={45} fill="#638ECB" fontSize="8" fontWeight="bold">ZONE C</SvgText>
            <SvgText x={270} y={45} fill="#638ECB" fontSize="8" fontWeight="bold">ZONE D</SvgText>

            {/* Active drone paths */}
            <Line x1={50} y1={40} x2={130} y2={100} stroke="#395886" strokeWidth={1.5} strokeDasharray="3 3" />
            <Line x1={130} y1={100} x2={210} y2={40} stroke="#395886" strokeWidth={1.5} strokeDasharray="3 3" />

            {/* Drone status indicators (Pulsing vectors) */}
            {drones.map((d, index) => {
              const xCoords = [50, 130, 210, 290];
              const yCoords = [40, 100, 40, 100];
              const isPatrolling = d.status === 'patrolling' || d.status === 'low-power';
              if (!isPatrolling) return null;

              return (
                <G key={d.id}>
                  <Circle cx={xCoords[index % 4]} cy={yCoords[index % 4]} r={6 * mapPulse} fill="rgba(16, 185, 129, 0.15)" />
                  <Circle cx={xCoords[index % 4]} cy={yCoords[index % 4]} r={3} fill="#10B981" />
                  <SvgText x={xCoords[index % 4] - 12} y={yCoords[index % 4] - 10} fill="#8AAEE0" fontSize="8" fontWeight="bold">
                    {d.id.split('-')[1]}
                  </SvgText>
                </G>
              );
            })}

            {/* Render alert hotspots if alerts exist */}
            {unresolvedAlerts.map((a, index) => {
              const xCoords = [90, 170, 250];
              const yCoords = [70, 30, 90];
              return (
                <G key={a.id}>
                  <Circle cx={xCoords[index % 3]} cy={yCoords[index % 3]} r={8} fill="rgba(239, 68, 68, 0.2)" />
                  <Circle cx={xCoords[index % 3]} cy={yCoords[index % 3]} r={4} fill="#EF4444" />
                </G>
              );
            })}
          </Svg>
        </View>

        {/* System Overview Dashboard Panel */}
        <View style={styles.consoleHeader}>
          <View style={styles.consoleStatus}>
            <View style={[styles.statusIndicatorDot, { backgroundColor: systemStatus.color }]} />
            <Text style={styles.consoleSubtitle}>FACILITY INDEX STATUS</Text>
            <Text style={styles.consoleTitle}>{systemStatus.title}</Text>
          </View>
          <View style={[styles.statusTag, { borderColor: systemStatus.color }]}>
            <Text style={[styles.statusTagText, { color: systemStatus.color }]}>{systemStatus.label}</Text>
          </View>
        </View>

        {/* Minimal Numeric Gauges */}
        <View style={styles.gaugeRow}>
          <View style={styles.gaugeBox}>
            <Text style={styles.gaugeVal}>
              {drones.filter(d => d.status === 'patrolling' || d.status === 'low-power').length}
            </Text>
            <Text style={styles.gaugeLabel}>AGENTS FLIGHT</Text>
          </View>
          <View style={styles.gaugeDivider} />
          <View style={styles.gaugeBox}>
            <Text style={styles.gaugeVal}>
              {drones.filter(d => d.status === 'charging').length}
            </Text>
            <Text style={styles.gaugeLabel}>DOCKED CHARGE</Text>
          </View>
          <View style={styles.gaugeDivider} />
          <View style={styles.gaugeBox}>
            <Text style={[styles.gaugeVal, { color: unresolvedAlerts.length > 0 ? '#F59E0B' : '#F0F3FA' }]}>
              {unresolvedAlerts.length}
            </Text>
            <Text style={styles.gaugeLabel}>LOGGED FAULTS</Text>
          </View>
        </View>

        {/* Automated System Settings Switch */}
        <View style={styles.balancerRow}>
          <View style={styles.balancerText}>
            <Text style={styles.balancerTitle}>FLEET COUPLING AUTO-BALANCER</Text>
            <Text style={styles.balancerDesc}>Rotates active patrols into charge pads autonomously</Text>
          </View>
          <Switch
            value={autoBalance}
            onValueChange={toggleAutoBalance}
            trackColor={{ false: '#171923', true: '#395886' }}
            thumbColor={autoBalance ? '#B1C9EF' : '#8AAEE0'}
          />
        </View>

        {/* Monospaced Terminal Feed */}
        <View style={styles.terminalHeader}>
          <Terminal size={14} color="#8AAEE0" />
          <Text style={styles.terminalTitle}>TELEMETRIC COMMAND LOG</Text>
        </View>

        <View style={styles.terminalFeed}>
          {unresolvedAlerts.length === 0 ? (
            <View style={styles.terminalEmpty}>
              <Text style={styles.terminalEmptyText}>STATUS: SECURE. MONITOR REGISTERS CLEAR.</Text>
            </View>
          ) : (
            unresolvedAlerts.map(alert => (
              <TouchableOpacity
                key={alert.id}
                style={styles.terminalLogItem}
                onPress={() => handleOpenAlert(alert)}
                activeOpacity={0.7}
              >
                <View style={styles.terminalLogHeader}>
                  <Text style={[styles.terminalSeverityText, { color: alert.severity === 'critical' ? '#EF4444' : '#F59E0B' }]}>
                    [{alert.severity.toUpperCase()}]
                  </Text>
                  <Text style={styles.terminalTime}>
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false })}
                  </Text>
                </View>
                <Text style={styles.terminalMessage} numberOfLines={2}>
                  &gt; {alert.message}
                </Text>
                <View style={styles.terminalLogFooter}>
                  <Text style={styles.terminalTypeText}>SRC: {alert.type.toUpperCase()}_SCANNER</Text>
                  <View style={styles.terminalDiagnose}>
                    <Text style={styles.terminalDiagnoseText}>DECK</Text>
                    <ChevronRight size={10} color="#8AAEE0" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>

      <AlertModal
        visible={modalVisible}
        alert={selectedAlert}
        onResolve={resolveAlert}
        onClose={() => {
          setModalVisible(false);
          setSelectedAlert(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080A', // Dark Obsidian theme background
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  hudRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1117',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#171923',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudMonoText: {
    color: '#8AAEE0',
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  mapContainer: {
    gap: 8,
  },
  mapHeading: {
    color: '#638ECB',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#171923',
    paddingBottom: 12,
    marginTop: 4,
  },
  consoleStatus: {
    gap: 2,
    position: 'relative',
    paddingLeft: 12,
  },
  statusIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 6,
  },
  consoleSubtitle: {
    color: '#638ECB',
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  consoleTitle: {
    color: '#F0F3FA',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusTag: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gaugeRow: {
    flexDirection: 'row',
    backgroundColor: '#0E1117',
    borderRadius: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#171923',
  },
  gaugeBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  gaugeVal: {
    color: '#F0F3FA',
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  gaugeLabel: {
    color: '#638ECB',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  gaugeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#171923',
    alignSelf: 'center',
  },
  balancerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1117',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#171923',
  },
  balancerText: {
    flex: 1,
    gap: 2,
  },
  balancerTitle: {
    color: '#F0F3FA',
    fontSize: 10.5,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  balancerDesc: {
    color: '#8AAEE0',
    fontSize: 9.5,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  terminalTitle: {
    color: '#8AAEE0',
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  terminalFeed: {
    gap: 8,
  },
  terminalEmpty: {
    backgroundColor: '#0E1117',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#171923',
  },
  terminalEmptyText: {
    color: '#10B981',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  terminalLogItem: {
    backgroundColor: '#0E1117',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#171923',
    gap: 6,
  },
  terminalLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  terminalSeverityText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  terminalTime: {
    color: '#638ECB',
    fontSize: 9.5,
    fontFamily: 'monospace',
  },
  terminalMessage: {
    color: '#D5DEEF',
    fontSize: 11.5,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  terminalLogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#171923',
    paddingTop: 8,
    marginTop: 2,
  },
  terminalTypeText: {
    color: '#638ECB',
    fontSize: 8.5,
    fontFamily: 'monospace',
  },
  terminalDiagnose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  terminalDiagnoseText: {
    color: '#8AAEE0',
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});

export default Dashboard;
