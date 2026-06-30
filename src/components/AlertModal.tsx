import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShieldAlert, CheckCircle, BellRing } from 'lucide-react-native';
import { AlertItem } from '../database/db';

interface AlertModalProps {
  visible: boolean;
  alert: AlertItem | null;
  onResolve: (id: string) => void;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ 
  visible, 
  alert, 
  onResolve, 
  onClose 
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible && alert?.severity === 'critical') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 700,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible, alert]);

  if (!alert) return null;

  const isCritical = alert.severity === 'critical' || alert.severity === 'high';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { borderColor: isCritical ? '#EF4444' : '#F59E0B' }]}>
          
          {/* Header Warning Ring */}
          <View style={styles.header}>
            <Animated.View style={[styles.iconRing, { transform: [{ scale: pulseAnim }], backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
              <ShieldAlert size={40} color={isCritical ? '#EF4444' : '#F59E0B'} />
            </Animated.View>
            <Text style={[styles.title, { color: isCritical ? '#FCA5A5' : '#FDE047' }]}>
              {isCritical ? 'CRITICAL SAFETY ALERT' : 'WARNING DEVIATION'}
            </Text>
          </View>

          {/* Alert content details */}
          <View style={styles.body}>
            <Text style={styles.timestamp}>
              LOGGED: {new Date(alert.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.message}>{alert.message}</Text>
            <View style={styles.severityRow}>
              <Text style={styles.label}>SEVERITY LEVEL:</Text>
              <Text style={[styles.severityValue, { color: isCritical ? '#EF4444' : '#F59E0B' }]}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.btnResolve, { backgroundColor: isCritical ? '#EF4444' : '#F59E0B' }]}
              onPress={() => {
                onResolve(alert.id);
                onClose();
              }}
            >
              <CheckCircle size={18} color="#FFFFFF" style={styles.btnIcon} />
              <Text style={styles.btnResolveText}>RESOLVE & SYNC FAULT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDismiss} onPress={onClose}>
              <Text style={styles.btnDismissText}>DISMISS WARNING</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  body: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timestamp: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  severityValue: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    gap: 12,
  },
  btnResolve: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnIcon: {
    marginRight: 8,
  },
  btnResolveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.8,
  },
  btnDismiss: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDismissText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default AlertModal;
