import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function VehicleFinderModal({ visible, vehicles, onClose }) {
  const [query, setQuery] = useState('');

  if (!visible) return null;

  const filtered = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(query.toLowerCase()) ||
      v.type.toLowerCase().includes(query.toLowerCase()) ||
      v.ownerFlat.toLowerCase().includes(query.toLowerCase())
  );

  const handleNotifyOwner = (v) => {
    Alert.alert(
      'Nudge Vehicle Owner',
      `Send polite notification to ${v.ownerFlat} stating that vehicle ${v.plate} needs to be moved?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          onPress: () =>
            Alert.alert(
              'Notification Dispatched!',
              `A high-priority alert has been delivered to Flat ${v.ownerFlat}'s GatePass app.`
            ),
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="car-sport" size={22} color={colors.primary} />
              <Text style={styles.headerTitle}>Vehicle & Parking Lookup</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>
            Search any vehicle number to locate the resident or report blocked parking.
          </Text>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plate (e.g. 4120 or Creta)..."
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="characters"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="alert-circle-outline" size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No matching society vehicle</Text>
                <Text style={styles.emptySub}>
                  This vehicle may belong to a commercial visitor or delivery partner.
                </Text>
              </View>
            ) : (
              filtered.map((v) => (
                <View key={v.plate} style={styles.vehicleCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.plateTag}>
                      <Text style={styles.plateText}>{v.plate}</Text>
                    </View>
                    <View style={styles.flatPill}>
                      <Text style={styles.flatPillText}>Flat {v.ownerFlat}</Text>
                    </View>
                  </View>

                  <Text style={styles.vehicleType}>{v.type}</Text>

                  <View style={styles.slotRow}>
                    <Ionicons name="pin" size={14} color={colors.secondary} />
                    <Text style={styles.slotText}>Assigned: {v.slot}</Text>
                  </View>

                  <View style={styles.rfidRow}>
                    <Ionicons name="radio" size={14} color={colors.success} />
                    <Text style={styles.rfidText}>{v.rfidTag}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.alertBtn}
                    onPress={() => handleNotifyOwner(v)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.alertBtnText}>Nudge Owner (Move Car)</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  closeBtn: {
    padding: 4,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  list: {
    marginBottom: 10,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  plateTag: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  plateText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 1,
  },
  flatPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  flatPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  vehicleType: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  slotText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rfidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  rfidText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  alertBtn: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  alertBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
