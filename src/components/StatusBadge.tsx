import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
  type?: 'severity' | 'drone' | 'audit';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'severity' }) => {
  const getBadgeColors = () => {
    const s = status.toLowerCase();

    // 1. Severity Styles
    if (type === 'severity') {
      switch (s) {
        case 'critical':
          return { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', text: '#FCA5A5' };
        case 'high':
          return { bg: 'rgba(249, 115, 22, 0.15)', border: '#F97316', text: '#FDBA74' };
        case 'medium':
          return { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FDE047' };
        case 'low':
        default:
          return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', text: '#93C5FD' };
      }
    }

    // 2. Drone Status Styles
    if (type === 'drone') {
      switch (s) {
        case 'patrolling':
          return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.6)', text: '#34D399' };
        case 'charging':
          return { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.6)', text: '#818CF8' };
        case 'low-power':
          return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.6)', text: '#F87171' };
        case 'idle':
        case 'docked':
        default:
          return { bg: 'rgba(100, 116, 139, 0.12)', border: 'rgba(100, 116, 139, 0.6)', text: '#94A3B8' };
      }
    }

    // 3. Audit Styles
    if (type === 'audit') {
      switch (s) {
        case 'completed':
          return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', text: '#6EE7B7' };
        case 'in-progress':
        case 'scanning':
          return { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FDE047' };
        case 'failed':
          return { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', text: '#FCA5A5' };
        case 'pending':
        default:
          return { bg: 'rgba(148, 163, 184, 0.1)', border: '#64748B', text: '#94A3B8' };
      }
    }

    return { bg: 'rgba(100, 116, 139, 0.1)', border: '#64748B', text: '#94A3B8' };
  };

  const colors = getBadgeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default StatusBadge;
