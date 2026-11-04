import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function IntercomCallModal({
  visible,
  request,
  onApprove,
  onDeny,
  onLeaveAtGate,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!visible || !request) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.callContainer}>
          {/* Top Call Status */}
          <View style={styles.topBar}>
            <View style={styles.liveCallingBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveCallingText}>INCOMING GATE INTERCOM CALL</Text>
            </View>
            <Text style={styles.gateName}>{request.gate || 'Main Gate #1'}</Text>
          </View>

          {/* Visitor CCTV Camera Simulation */}
          <View style={styles.cameraFrame}>
            <Image
              source={{
                uri:
                  request.image ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
              }}
              style={styles.cctvImage}
              resizeMode="cover"
            />
            {/* Camera Overlay Elements */}
            <View style={styles.cctvOverlayTop}>
              <View style={styles.recBadge}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>GATE CAM 01 • LIVE</Text>
              </View>
              <Text style={styles.timestampText}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
            </View>

            <View style={styles.cctvOverlayBottom}>
              <Text style={styles.visitorName}>{request.name}</Text>
              <Text style={styles.visitorPurpose}>{request.purpose}</Text>
            </View>
          </View>

          {/* Verification Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.badgeItem}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
              <Text style={styles.badgeItemText}>Guard Verified</Text>
            </View>
            {request.vehicle && (
              <View style={styles.badgeItem}>
                <Ionicons name="car" size={14} color={colors.primary} />
                <Text style={styles.badgeItemText}>{request.vehicle}</Text>
              </View>
            )}
            <View style={styles.badgeItem}>
              <Ionicons name="call" size={14} color={colors.secondary} />
              <Text style={styles.badgeItemText}>{request.phone || '+91 Guard Line'}</Text>
            </View>
          </View>

          {/* Two-Way Audio Talk Toggle */}
          <TouchableOpacity
            style={[styles.talkBtn, isSpeaking && styles.talkBtnActive]}
            onPress={() => setIsSpeaking(!isSpeaking)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSpeaking ? 'mic' : 'mic-outline'}
              size={18}
              color={isSpeaking ? '#FFFFFF' : colors.primary}
            />
            <Text style={[styles.talkBtnText, isSpeaking && styles.talkBtnTextActive]}>
              {isSpeaking ? 'Speaking with Guard (Tap to Mute)' : 'Tap to Speak with Gate Guard'}
            </Text>
          </TouchableOpacity>

          {/* Action Decision Buttons (Allow / Leave at Gate / Deny) */}
          <View style={styles.decisionRow}>
            {/* Deny Button */}
            <TouchableOpacity
              style={styles.denyAction}
              onPress={() => onDeny(request.id)}
              activeOpacity={0.8}
            >
              <View style={styles.denyCircle}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Deny Entry</Text>
            </TouchableOpacity>

            {/* Leave at Gate (if delivery) */}
            {request.category === 'delivery' && (
              <TouchableOpacity
                style={styles.leaveAction}
                onPress={() => onLeaveAtGate(request.id)}
                activeOpacity={0.8}
              >
                <View style={styles.leaveCircle}>
                  <Ionicons name="cube" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.actionLabel}>Leave at Gate</Text>
              </TouchableOpacity>
            )}

            {/* Allow Entry Button */}
            <TouchableOpacity
              style={styles.allowAction}
              onPress={() => onApprove(request.id)}
              activeOpacity={0.8}
            >
              <View style={styles.allowCircle}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Allow Entry</Text>
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
    backgroundColor: 'rgba(11, 27, 61, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  callContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  topBar: {
    alignItems: 'center',
    marginBottom: 12,
  },
  liveCallingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveCallingText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gateName: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  cameraFrame: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    marginBottom: 12,
  },
  cctvImage: {
    width: '100%',
    height: '100%',
  },
  cctvOverlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  recText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  timestampText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cctvOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
  },
  visitorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  visitorPurpose: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  talkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  talkBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  talkBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  talkBtnTextActive: {
    color: '#FFFFFF',
  },
  decisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 6,
  },
  denyAction: {
    alignItems: 'center',
    gap: 6,
  },
  denyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  leaveAction: {
    alignItems: 'center',
    gap: 6,
  },
  leaveCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  allowAction: {
    alignItems: 'center',
    gap: 6,
  },
  allowCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

