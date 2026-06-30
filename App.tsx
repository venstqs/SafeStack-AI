import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import Dashboard from './src/screens/Dashboard';
import Structural from './src/screens/Structural';
import VisionAI from './src/screens/VisionAI';
import RapidAudit from './src/screens/RapidAudit';
import PowerDocking from './src/screens/PowerDocking';
import { Cpu, Layers, Eye, Compass, BatteryCharging } from 'lucide-react-native';

const MainAppContent: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();

  // Screen routing
  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'structural':
        return <Structural />;
      case 'vision':
        return <VisionAI />;
      case 'audit':
        return <RapidAudit />;
      case 'docking':
        return <PowerDocking />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Cpu },
    { id: 'structural', label: 'Structure', icon: Layers },
    { id: 'vision', label: 'Vision AI', icon: Eye },
    { id: 'audit', label: 'Audit', icon: Compass },
    { id: 'docking', label: 'Power Grid', icon: BatteryCharging },
  ];

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      {/* Premium Header Logo */}
      <View style={styles.appHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.logoMark}>
            <View style={styles.logoInner} />
          </View>
          <View>
            <Text style={styles.appHeaderTitle}>SAFESTACK AI</Text>
            <Text style={styles.headerSubtitle}>COMMAND INTERFACE</Text>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.indicatorDot} />
          <Text style={styles.indicatorText}>ONLINE</Text>
        </View>
      </View>

      {/* Screen viewport */}
      <View style={styles.viewport}>{renderScreen()}</View>

      {/* Modern 5-Button Tab Bar */}
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          // Switch to active screen
          const handlePress = () => {
            // Map legacy screen names if clicked in the context
            if (item.id === 'vision') {
              setActiveScreen('vision');
            } else {
              setActiveScreen(item.id);
            }
          };

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={handlePress}
              activeOpacity={0.75}
            >
              <View style={styles.iconWrapper}>
                <Icon 
                  size={19} 
                  color={isActive ? '#F0F3FA' : '#628ECB'} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && <View style={styles.activeDot} />}
              </View>
              <Text style={[
                styles.navLabel, 
                { color: isActive ? '#F0F3FA' : '#628ECB', fontWeight: isActive ? '900' : '600' }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19', // Rich dark steel-blue background
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1.5,
    borderColor: 'rgba(138, 174, 224, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#B1C9EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#8AAEE0',
  },
  appHeaderTitle: {
    color: '#F0F3FA',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#8AAEE0',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  indicatorText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  viewport: {
    flex: 1,
  },
  navBar: {
    height: 64,
    backgroundColor: '#1C273C', // Raised steel-blue footer bar
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'rgba(177, 201, 239, 0.1)',
    paddingBottom: 6,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  iconWrapper: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B1C9EF',
    position: 'absolute',
    bottom: -6,
  },
  navLabel: {
    fontSize: 8,
    letterSpacing: 0.2,
  },
});
