import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const EMERGENCY_TYPES = [
  { id: 'security', label: 'Security Threat', icon: 'shield-outline', color: '#EF4444' },
  { id: 'medical', label: 'Medical Emergency', icon: 'medkit-outline', color: '#DC2626' },
  { id: 'fire', label: 'Fire Alarm', icon: 'flame-outline', color: '#EA580C' },
  { id: 'lift', label: 'Lift Stuck', icon: 'alert-circle-outline', color: '#D97706' },
];

export default function SOSModal({ visible, onClose, onTriggerAlert }) {
  const [activeAlert, setActiveAlert] = useState(null);

  const handleTrigger = (item) => {
    setActiveAlert(item);
    if (onTriggerAlert) {
      onTriggerAlert(item);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="warning" size={26} color="#DC2626" />
              <Text style={styles.title}>EMERGENCY SOS</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Triggering an alert instantly notifies the main gate security guards and broadcasts to emergency contacts.
          </Text>

          {activeAlert ? (
            <View style={styles.alertTriggeredBox}>
              <Ionicons name="notifications" size={44} color="#DC2626" />
              <Text style={styles.alertTriggeredTitle}>ALERT SENT TO MAIN GATE!</Text>
              <Text style={styles.alertTriggeredSub}>
                Guards are dispatched to Flat B-402 for {activeAlert.label}.
              </Text>
              <TouchableOpacity
                style={styles.cancelAlertBtn}
                onPress={() => {
                  setActiveAlert(null);
                  onClose();
                }}
              >
                <Text style={styles.cancelAlertBtnText}>I am Safe (Dismiss)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {EMERGENCY_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sosCard, { borderColor: item.color }]}
                  onPress={() => handleTrigger(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sosCardText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.callSecurityBtn} onPress={() => Alert.alert('Calling Guard', 'Dialing Main Gate Intercom: +91 80 4000 1234')}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.callSecurityText}>Call Main Gate Security Desk Directly</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 18,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  sosCard: {
    width: '48%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  alertTriggeredBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  alertTriggeredTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  alertTriggeredSub: {
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cancelAlertBtn: {
    marginTop: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelAlertBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  callSecurityBtn: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  callSecurityText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

