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

const CATEGORIES = [
  { id: 'Electrical', icon: 'flash', color: '#F59E0B' },
  { id: 'Plumbing', icon: 'water', color: '#0284C7' },
  { id: 'Housekeeping', icon: 'sparkles', color: '#10B981' },
  { id: 'Lift & Common', icon: 'business', color: '#6366F1' },
  { id: 'Security', icon: 'shield', color: '#EF4444' },
  { id: 'Pest Control', icon: 'bug', color: '#8B5CF6' },
];

export default function HelpdeskModal({ visible, tickets, onClose, onAddTicket }) {
  const [selectedCat, setSelectedCat] = useState('Electrical');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isRaising, setIsRaising] = useState(false);

  if (!visible) return null;

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a brief complaint title');
      return;
    }

    const newTicket = {
      id: 'TICK-' + Math.floor(100 + Math.random() * 900),
      category: selectedCat,
      title: title.trim(),
      description: desc.trim() || 'No additional details provided.',
      status: 'In Progress',
      assignedTo: `Assigned to Society ${selectedCat} Team`,
      priority: priority,
      createdDate: 'Just now',
      eta: 'Today by 05:00 PM',
    };

    onAddTicket(newTicket);
    setTitle('');
    setDesc('');
    setIsRaising(false);
    Alert.alert('Ticket Raised!', `Ticket #${newTicket.id} has been registered and dispatched to the facility manager.`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="build" size={22} color={colors.secondary} />
              <Text style={styles.headerTitle}>Society Helpdesk</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Toggle View: View Tickets vs Raise Ticket */}
          <View style={styles.tabToggle}>
            <TouchableOpacity
              style={[styles.tabBtn, !isRaising && styles.tabBtnActive]}
              onPress={() => setIsRaising(false)}
            >
              <Text style={[styles.tabBtnText, !isRaising && styles.tabBtnTextActive]}>
                Active Tickets ({tickets.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, isRaising && styles.tabBtnActive]}
              onPress={() => setIsRaising(true)}
            >
              <Text style={[styles.tabBtnText, isRaising && styles.tabBtnTextActive]}>
                + Raise New Complaint
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {isRaising ? (
              /* Raise New Ticket Form */
              <View style={styles.formContainer}>
                <Text style={styles.label}>Select Service Category</Text>
                <View style={styles.catGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catPill,
                        selectedCat === cat.id && styles.catPillSelected,
                      ]}
                      onPress={() => setSelectedCat(cat.id)}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={16}
                        color={selectedCat === cat.id ? '#FFFFFF' : cat.color}
                      />
                      <Text
                        style={[
                          styles.catText,
                          selectedCat === cat.id && styles.catTextSelected,
                        ]}
                      >
                        {cat.id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Issue Summary *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Geyser tripping MCB switch in Master Bed"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.label}>Detailed Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Explain when it started, specific room, etc."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  value={desc}
                  onChangeText={setDesc}
                />

                <Text style={styles.label}>Urgency / Priority</Text>
                <View style={styles.priorityRow}>
                  {['Low', 'Medium', 'Emergency'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityPill,
                        priority === p && styles.priorityPillSelected,
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          priority === p && styles.priorityTextSelected,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Complaint to Facility</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Tickets List */
              <View style={styles.ticketList}>
                {tickets.map((t) => (
                  <View key={t.id} style={styles.ticketCard}>
                    <View style={styles.ticketTop}>
                      <View style={styles.ticketCategoryBadge}>
                        <Text style={styles.ticketCategoryText}>{t.category}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              t.status === 'Resolved' ? '#ECFDF5' : '#FFFBEB',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                t.status === 'Resolved' ? colors.success : '#D97706',
                            },
                          ]}
                        >
                          {t.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.ticketTitle}>{t.title}</Text>
                    <Text style={styles.ticketDesc}>{t.description}</Text>

                    <View style={styles.ticketFooter}>
                      <View style={styles.assignRow}>
                        <Ionicons name="person-circle-outline" size={14} color="#64748B" />
                        <Text style={styles.assignText}>{t.assignedTo}</Text>
                      </View>
                      <Text style={styles.ticketDate}>{t.createdDate}</Text>
                    </View>
                  </View>
                ))}
              </View>
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
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  closeBtn: {
    padding: 4,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  scrollArea: {
    marginBottom: 12,
  },
  formContainer: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  catTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  priorityPillSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  priorityTextSelected: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  ticketList: {
    gap: 12,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketCategoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assignText: {
    fontSize: 11,
    color: '#64748B',
  },
  ticketDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
