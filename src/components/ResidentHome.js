import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { communityPoll } from '../data/mockData';

export default function ResidentHome({
  pendingRequests,
  recentActivity,
  onApproveRequest,
  onDenyRequest,
  onQuickAction,
  onOpenSOS,
  onOpenQRModal,
  onOpenHelpdesk,
  onOpenVehicleFinder,
  onSelectPendingForCall,
}) {
  const [poll, setPoll] = useState(communityPoll);

  const handleVote = (optionId) => {
    if (poll.hasVoted) return;
    const updatedOptions = poll.options.map((opt) => {
      if (opt.id === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });
    const newTotal = poll.totalVotes + 1;
    const withPercentages = updatedOptions.map((opt) => ({
      ...opt,
      percent: Math.round((opt.votes / newTotal) * 100),
    }));
    setPoll({
      ...poll,
      totalVotes: newTotal,
      options: withPercentages,
      hasVoted: true,
      selectedId: optionId,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Banner with GatePass Branding */}
      <View style={styles.heroCard}>
        <Image
          source={require('../../assets/gatepass_banner.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>LIVE GATE PROTECTION</Text>
          </View>
          <Text style={styles.heroSlogan}>
            Every Entry Secure. Every Resident Safe.
          </Text>
        </View>
      </View>

      {/* Pending Approvals Section (Top Priority Alert with CCTV preview tap) */}
      {pendingRequests.length > 0 && (
        <View style={styles.pendingSection}>
          <View style={styles.pendingHeader}>
            <View style={styles.pulseDot} />
            <Text style={styles.pendingTitle}>
              Waiting at Gate ({pendingRequests.length})
            </Text>
            <Text style={styles.atGateTag}>Tap for Intercom Cam</Text>
          </View>

          {pendingRequests.map((req) => (
            <TouchableOpacity
              key={req.id}
              style={styles.reqCard}
              onPress={() => onSelectPendingForCall && onSelectPendingForCall(req)}
              activeOpacity={0.9}
            >
              <View style={styles.reqTop}>
                <Image
                  source={{
                    uri:
                      req.image ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
                  }}
                  style={styles.avatarImg}
                />

                <View style={styles.reqInfo}>
                  <View style={styles.reqTitleRow}>
                    <Text style={styles.reqName}>{req.name}</Text>
                    <View style={styles.ringingPill}>
                      <Ionicons name="call" size={11} color="#DC2626" />
                      <Text style={styles.ringingText}>Ringing</Text>
                    </View>
                  </View>
                  <Text style={styles.reqPurpose}>{req.purpose}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color="#64748B" />
                    <Text style={styles.metaText}>{req.gate}</Text>
                    {req.vehicle && (
                      <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>{req.vehicle}</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={styles.denyBtn}
                  onPress={() => onDenyRequest(req.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color={colors.danger} />
                  <Text style={styles.denyBtnText}>Deny</Text>
                </TouchableOpacity>

                {req.category === 'delivery' && (
                  <TouchableOpacity
                    style={styles.leaveGateBtn}
                    onPress={() => onApproveRequest(req.id, true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="cube-outline" size={15} color={colors.primary} />
                    <Text style={styles.leaveGateBtnText}>Leave at Gate</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.allowBtn}
                  onPress={() => onApproveRequest(req.id, false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.allowBtnText}>Allow Entry</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 6 Core Feature Shortcuts (Matches Logo Exactly) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GatePass Services</Text>
        <View style={styles.gridContainer}>
          {/* 1. Visitor Entry */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onQuickAction('guest')}
            activeOpacity={0.75}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={24} color="#2563EB" />
            </View>
            <Text style={styles.gridTitle}>Visitor Entry</Text>
            <Text style={styles.gridSub}>Invite Guest</Text>
          </TouchableOpacity>

          {/* 2. QR Pass */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() =>
              onOpenQRModal({
                name: 'Guest Pass',
                code: 'GP-7821',
                type: 'qr',
              })
            }
            activeOpacity={0.75}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#FAF5FF' }]}>
              <Ionicons name="qr-code" size={24} color="#9333EA" />
            </View>
            <Text style={styles.gridTitle}>QR Pass</Text>
            <Text style={styles.gridSub}>Instant Code</Text>
          </TouchableOpacity>

          {/* 3. Delivery Entry */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onQuickAction('delivery')}
            activeOpacity={0.75}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="bicycle" size={24} color="#EA580C" />
            </View>
            <Text style={styles.gridTitle}>Delivery Entry</Text>
            <Text style={styles.gridSub}>Food & Parcel</Text>
          </TouchableOpacity>

          {/* 4. Staff & Service Entry */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onQuickAction('service')}
            activeOpacity={0.75}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="construct" size={22} color="#059669" />
            </View>
            <Text style={styles.gridTitle}>Staff Entry</Text>
            <Text style={styles.gridSub}>Maid & Repairs</Text>
          </TouchableOpacity>

          {/* 5. Vehicle Access */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={onOpenVehicleFinder}
            activeOpacity={0.75}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#F0F9FF' }]}>
              <Ionicons name="car-sport" size={24} color="#0284C7" />
            </View>
            <Text style={styles.gridTitle}>Vehicle Access</Text>
            <Text style={styles.gridSub}>Parking & Lookup</Text>
          </TouchableOpacity>

          {/* 6. Instant Alerts / SOS */}
          <TouchableOpacity
            style={[styles.gridCard, styles.sosCardBorder]}
            onPress={onOpenSOS}
            activeOpacity={0.75}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="notifications" size={24} color="#DC2626" />
            </View>
            <Text style={[styles.gridTitle, { color: '#DC2626' }]}>Instant Alerts</Text>
            <Text style={styles.gridSub}>Emergency SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Community Quick Utilities Strip (Helpdesk, Directory, Vehicle) */}
      <View style={styles.quickUtilityBar}>
        <TouchableOpacity style={styles.utilItem} onPress={onOpenHelpdesk}>
          <View style={[styles.utilIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="build-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.utilText}>Helpdesk & Repairs</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.utilItem} onPress={onOpenVehicleFinder}>
          <View style={[styles.utilIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="search-outline" size={18} color="#D97706" />
          </View>
          <Text style={styles.utilText}>Find Vehicle Owner</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Interactive Society Community Poll (MyGate Feature) */}
      <View style={styles.pollCard}>
        <View style={styles.pollHeader}>
          <View style={styles.pollBadge}>
            <Ionicons name="pie-chart" size={14} color={colors.primary} />
            <Text style={styles.pollBadgeText}>COMMUNITY POLL</Text>
          </View>
          <Text style={styles.pollVotes}>{poll.totalVotes} residents voted</Text>
        </View>

        <Text style={styles.pollQuestion}>{poll.question}</Text>

        <View style={styles.optionsList}>
          {poll.options.map((opt) => {
            const isSelected = poll.selectedId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionRow,
                  poll.hasVoted && styles.optionRowVoted,
                  isSelected && styles.optionRowSelected,
                ]}
                onPress={() => handleVote(opt.id)}
                disabled={poll.hasVoted}
                activeOpacity={0.7}
              >
                {/* Background Progress Fill */}
                {poll.hasVoted && (
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${opt.percent}%`,
                        backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.18)' : '#F1F5F9',
                      },
                    ]}
                  />
                )}

                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && { color: colors.secondary, fontWeight: '800' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {poll.hasVoted && (
                    <Text
                      style={[
                        styles.optionPercent,
                        isSelected && { color: colors.secondary, fontWeight: '800' },
                      ]}
                    >
                      {opt.percent}%
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {poll.hasVoted && (
          <Text style={styles.votedNote}>✅ Your vote has been recorded anonymously.</Text>
        )}
      </View>

      {/* Recent Gate Activity Log */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Gate Activity</Text>
          <Text style={styles.seeAllText}>Flat B-402 Log</Text>
        </View>

        <View style={styles.activityList}>
          {recentActivity.map((item) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name={
                    item.category === 'staff'
                      ? 'person'
                      : item.category === 'cab'
                      ? 'car'
                      : item.category === 'delivery'
                      ? 'cube'
                      : 'walk'
                  }
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.activityMeta}>
                  {item.role} • {item.gate}
                </Text>
              </View>
              <View style={styles.activityRight}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        item.status === 'approved' ? '#ECFDF5' : '#F1F5F9',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          item.status === 'approved' ? colors.success : '#475569',
                      },
                    ]}
                  >
                    {item.action}
                  </Text>
                </View>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  heroCard: {
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    backgroundColor: colors.primaryDark,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.65,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(11, 27, 61, 0.75)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroSlogan: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingSection: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.secondaryDark,
    flex: 1,
  },
  atGateTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  reqTop: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
  },
  reqInfo: {
    flex: 1,
  },
  reqTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reqName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ringingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ringingText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '800',
  },
  reqPurpose: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 10,
  },
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  denyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  denyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  leaveGateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  leaveGateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  allowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.success,
  },
  allowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sosCardBorder: {
    borderColor: '#FCA5A5',
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gridSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  quickUtilityBar: {
    gap: 10,
    marginBottom: 16,
  },
  utilItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  utilIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  utilText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pollCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pollBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  pollVotes: {
    fontSize: 11,
    color: colors.textMuted,
  },
  pollQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    lineHeight: 18,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  optionRowVoted: {
    borderColor: '#E2E8F0',
  },
  optionRowSelected: {
    borderColor: colors.secondary,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionLabel: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  optionPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  votedNote: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
    marginTop: 8,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activityMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
});
