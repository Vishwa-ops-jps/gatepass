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

const DELIVERY_PARTNERS = ['Zomato', 'Swiggy', 'Blinkit', 'Amazon', 'Flipkart', 'Zepto', 'Instamart', 'Other'];
const CAB_PARTNERS = ['Uber', 'Ola', 'Rapido', 'BluSmart', 'Other'];

export default function QuickActionModal({ visible, actionType, onClose, onCreatePass }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [leaveAtGate, setLeaveAtGate] = useState(false);

  if (!visible) return null;

  const getTitle = () => {
    switch (actionType) {
      case 'guest':
        return 'Invite Guest';
      case 'delivery':
        return 'Pre-Approve Delivery';
      case 'cab':
        return 'Allow Cab Entry';
      case 'service':
        return 'Pre-Approve Service / Staff';
      default:
        return 'Create GatePass';
    }
  };

  const handleSubmit = () => {
    const randomCode = 'GP-' + Math.floor(1000 + Math.random() * 9000);
    let passName = name;

    if (actionType === 'delivery') {
      passName = selectedPartner ? `${selectedPartner} Delivery` : name || 'Delivery Partner';
    } else if (actionType === 'cab') {
      passName = selectedPartner ? `${selectedPartner} (${vehicleNo || 'Cab'})` : name || 'Cab';
    }

    if (!passName && actionType === 'guest') {
      Alert.alert('Required', 'Please enter guest name');
      return;
    }

    const newPass = {
      code: randomCode,
      name: passName || 'Expected Visitor',
      phone: phone || '+91 98765 00000',
      type: actionType,
      leaveAtGate: leaveAtGate,
    };

    onCreatePass(newPass);
    // Reset fields
    setName('');
    setPhone('');
    setSelectedPartner('');
    setVehicleNo('');
    setLeaveAtGate(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Delivery specific partner chips */}
            {actionType === 'delivery' && (
              <View style={styles.fieldSection}>
                <Text style={styles.label}>Select Delivery Service</Text>
                <View style={styles.chipGrid}>
                  {DELIVERY_PARTNERS.map((partner) => (
                    <TouchableOpacity
                      key={partner}
                      style={[
                        styles.chip,
                        selectedPartner === partner && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedPartner(partner)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedPartner === partner && styles.chipTextSelected,
                        ]}
                      >
                        {partner}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Leave at gate checkbox */}
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => setLeaveAtGate(!leaveAtGate)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={leaveAtGate ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={leaveAtGate ? colors.secondary : '#94A3B8'}
                  />
                  <Text style={styles.toggleText}>Leave parcel at Security Gate</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cab specific partner chips */}
            {actionType === 'cab' && (
              <View style={styles.fieldSection}>
                <Text style={styles.label}>Select Cab Operator</Text>
                <View style={styles.chipGrid}>
                  {CAB_PARTNERS.map((partner) => (
                    <TouchableOpacity
                      key={partner}
                      style={[
                        styles.chip,
                        selectedPartner === partner && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedPartner(partner)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedPartner === partner && styles.chipTextSelected,
                        ]}
                      >
                        {partner}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Vehicle Number (Last 4 Digits)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 4120"
                  placeholderTextColor="#94A3B8"
                  value={vehicleNo}
                  onChangeText={setVehicleNo}
                />
              </View>
            )}

            {/* Guest / Service inputs */}
            {(actionType === 'guest' || actionType === 'service') && (
              <>
                <View style={styles.fieldSection}>
                  <Text style={styles.label}>
                    {actionType === 'guest' ? "Visitor's Full Name" : 'Staff / Service Name'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={actionType === 'guest' ? 'e.g. Priyanshu Sharma' : 'e.g. Urban Company Electrician'}
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.fieldSection}>
                  <Text style={styles.label}>Mobile Number (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </>
            )}

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
              <Text style={styles.securityText}>
                The security guard will directly grant entry without ringing your intercom once verified.
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Generate Entry GatePass</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
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
    padding: 22,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  fieldSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

