import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../services/api';

export default function DevToolsModal({
  visible,
  onClose,
  backendConnected,
  currentUser,
  onSwitchRole,
}) {
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const triggerSimulation = async (endpoint, payload, desc) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setLoading(false);
      Alert.alert('Simulation Dispatched! ⚡', `${desc} sent through SQLite & WebSocket.`);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', err.message);
    }
  };

  const handleResetDB = async () => {
    Alert.alert(
      'Reset SQLite Database',
      'This will re-run migrations and restore clean initial seed data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset DB',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/dev/reset-db`, { method: 'POST' });
              Alert.alert('Database Reset', 'SQLite database has been re-seeded.');
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="construct" size={20} color="#F59E0B" />
              <Text style={styles.title}>Full-Stack Developer Sandbox</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>
            Real-time event dispatching, WebSocket monitor & SQLite controls
          </Text>

          {/* System Status Chips */}
          <View style={styles.chipsRow}>
            <View style={[styles.chip, { backgroundColor: backendConnected ? '#ECFDF5' : '#FEF2F2' }]}>
              <View style={[styles.dot, { backgroundColor: backendConnected ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.chipText, { color: backendConnected ? '#059669' : '#DC2626' }]}>
                {backendConnected ? 'API & WS: 5001 Live' : 'Backend Offline'}
              </Text>
            </View>
            <View style={[styles.chip, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="server-outline" size={12} color="#2563EB" />
              <Text style={[styles.chipText, { color: '#1D4ED8' }]}>SQLite (node:sqlite WAL)</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Real-time Simulators */}
            <Text style={styles.sectionHeader}>Instant WebSocket Event Simulators</Text>
            <View style={styles.grid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  triggerSimulation(
                    '/requests',
                    {
                      name: 'Zomato Food Rider',
                      phone: '+91 91234 56789',
                      type: 'Delivery',
                      category: 'delivery',
                      gate: 'Gate #2 (Service)',
                      purpose: 'Biryani Order #9910',
                      flat: 'B-402',
                    },
                    'Zomato delivery arrival at Gate 2'
                  )
                }
                activeOpacity={0.7}
              >
                <Ionicons name="bicycle" size={22} color="#EA580C" />
                <Text style={styles.actionCardTitle}>Ring Zomato Rider</Text>
                <Text style={styles.actionCardSub}>Triggers Intercom CCTV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  triggerSimulation(
                    '/requests',
                    {
                      name: 'Dr. Alok Verma',
                      phone: '+91 98765 00000',
                      type: 'Guest',
                      category: 'guest',
                      vehicle: 'KA-03-MG-4120',
                      gate: 'Main Gate 1',
                      purpose: 'Family Visit',
                      flat: 'B-402',
                    },
                    'Guest arrival at Main Gate 1'
                  )
                }
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={22} color="#2563EB" />
                <Text style={styles.actionCardTitle}>Ring Guest (B-402)</Text>
                <Text style={styles.actionCardSub}>Car KA-03-MG-4120</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  triggerSimulation(
                    '/passes/verify',
                    { code: 'GP-7821' },
                    'Passcode GP-7821 validated'
                  )
                }
                activeOpacity={0.7}
              >
                <Ionicons name="qr-code" size={22} color="#10B981" />
                <Text style={styles.actionCardTitle}>Verify Pass GP-7821</Text>
                <Text style={styles.actionCardSub}>Simulates Guard Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { borderColor: '#FCA5A5' }]}
                onPress={() =>
                  triggerSimulation(
                    '/sos',
                    { type: 'Medical Emergency', flat: 'Flat B-402' },
                    'SOS Emergency alarm'
                  )
                }
                activeOpacity={0.7}
              >
                <Ionicons name="warning" size={22} color="#DC2626" />
                <Text style={[styles.actionCardTitle, { color: '#DC2626' }]}>Trigger SOS Alert</Text>
                <Text style={styles.actionCardSub}>Broadcasts Siren</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Developer Links */}
            <Text style={styles.sectionHeader}>Developer Tools & Database</Text>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL('http://localhost:5001/api-docs')}
              activeOpacity={0.7}
            >
              <Ionicons name="code-slash" size={18} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.linkRowTitle}>Open API Test Dashboard</Text>
                <Text style={styles.linkRowSub}>http://localhost:5001/api-docs</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleResetDB} activeOpacity={0.8}>
              <Ionicons name="refresh" size={16} color="#DC2626" />
              <Text style={styles.resetBtnText}>Reset SQLite DB to Clean Seed</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  closeBtn: {
    padding: 4,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollArea: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 10,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  actionCardSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  linkRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  linkRowSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  resetBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
});
