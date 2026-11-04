import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { initialMaintenanceBill, communityNotices } from '../data/mockData';

export default function MaintenanceTab() {
  const [bill, setBill] = useState(initialMaintenanceBill);
  const isPaid = bill.status === 'Paid';

  const handlePay = () => {
    Alert.alert(
      'Pay Society Maintenance',
      `Pay ₹${bill.amount.toLocaleString()} for ${bill.month}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay with UPI / Card',
          onPress: () => {
            setBill({ ...bill, status: 'Paid' });
            Alert.alert('Payment Successful!', `Transaction ID: GP-TXN-${Date.now().toString().slice(-6)}\nReceipt emailed to your registered address.`);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Bill Overview Card */}
      <View style={styles.billCard}>
        <View style={styles.billTop}>
          <View>
            <Text style={styles.billTitle}>Maintenance Due</Text>
            <Text style={styles.billMonth}>{bill.month}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isPaid ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: isPaid ? colors.success : colors.danger },
              ]}
            >
              {bill.status}
            </Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.amount}>{bill.amount.toLocaleString()}</Text>
          <Text style={styles.dueDateText}>Due: {bill.dueDate}</Text>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownBox}>
          {bill.breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownRow}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemAmount}>₹{item.amount}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.payBtn, isPaid && styles.paidBtn]}
          onPress={handlePay}
          disabled={isPaid}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPaid ? 'checkmark-circle' : 'card-outline'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.payBtnText}>
            {isPaid ? 'Paid & Verified' : `Pay ₹${bill.amount.toLocaleString()} Now`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Community Notices */}
      <View style={styles.noticesSection}>
        <Text style={styles.sectionHeader}>Society Announcements</Text>
        {communityNotices.map((notice) => (
          <View key={notice.id} style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{notice.tag}</Text>
              </View>
              <Text style={styles.noticeDate}>{notice.date}</Text>
            </View>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeDesc}>{notice.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  billTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  billMonth: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  currency: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2,
  },
  amount: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primaryDark,
    marginRight: 10,
  },
  dueDateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  breakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  payBtn: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  paidBtn: {
    backgroundColor: colors.success,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  noticesSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  noticeDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

