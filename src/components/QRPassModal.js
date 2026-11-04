import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function QRPassModal({ visible, passData, onClose }) {
  if (!passData) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `*GatePass Entry Pass for Emerald Heights Residency*\nPasscode: *${passData.code}*\nVisitor: ${passData.name}\nValid For: Flat B-402\nShow this code or QR pass to the security guard at Gate 1.\n\nSecured with GatePass™`,
      });
    } catch (e) {
      Alert.alert('Share', 'Passcode copied to clipboard: ' + passData.code);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="shield-checkmark" size={22} color={colors.secondary} />
              <Text style={styles.headerTitle}>Digital GatePass</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.subTitle}>Show this Pass or Passcode to Security</Text>

          {/* Simulated QR Code Graphic */}
          <View style={styles.qrContainer}>
            <View style={styles.qrPatternBox}>
              <Ionicons name="qr-code-outline" size={170} color={colors.primaryDark} />
            </View>
            <View style={styles.qrBadge}>
              <Text style={styles.qrBadgeText}>ONE-TIME ENTRY</Text>
            </View>
          </View>

          {/* Passcode Highlight */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>ENTRY PASSCODE</Text>
            <Text style={styles.codeValue}>{passData.code || 'GP-8492'}</Text>
            <Text style={styles.codeHint}>Valid for 24 hours</Text>
          </View>

          {/* Details Table */}
          <View style={styles.infoTable}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Visitor Name</Text>
              <Text style={styles.infoVal}>{passData.name || 'Invited Guest'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Destination</Text>
              <Text style={styles.infoVal}>Flat B-402, Block B</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Allowed Gate</Text>
              <Text style={styles.infoVal}>Any Society Gate</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Security Verification</Text>
              <Text style={[styles.infoVal, { color: colors.success, fontWeight: '700' }]}>
                Pre-Approved
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  headerTitleRow: {
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
  subTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  qrPatternBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  qrBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  qrBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeContainer: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 14,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryDark,
    letterSpacing: 0.8,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.secondary,
    letterSpacing: 2,
    marginVertical: 2,
  },
  codeHint: {
    fontSize: 11,
    color: '#9A3412',
  },
  infoTable: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoKey: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  btnRow: {
    width: '100%',
    gap: 8,
  },
  shareBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  doneBtn: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  doneBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
});

