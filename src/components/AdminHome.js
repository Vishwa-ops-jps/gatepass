import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiGetAdminOverview, apiTriggerSOS } from '../services/api';

const DEFAULT_FLATS = [
  { flat: 'B-402', block: 'B', floor: '4th', owner: 'Vishwa (Resident Owner)', phone: '9876543210', status: 'Occupied', dues: 'Unpaid', vehicle: 'KA-05-MM-9214' },
  { flat: 'A-104', block: 'A', floor: '1st', owner: 'Pooja Malhotra', phone: '9811122233', status: 'Occupied', dues: 'Unpaid', vehicle: 'KA-03-MG-4120' },
  { flat: 'C-201', block: 'C', floor: '2nd', owner: 'Dr. Alok Verma', phone: '9822233445', status: 'Occupied', dues: 'Paid', vehicle: 'KA-51-AB-8800' },
  { flat: 'A-101', block: 'A', floor: '1st', owner: 'Suresh Raina', phone: '9811100223', status: 'Occupied', dues: 'Paid', vehicle: 'KA-01-EE-3312' },
  { flat: 'A-202', block: 'A', floor: '2nd', owner: 'Meera Sen', phone: '9844001122', status: 'Occupied', dues: 'Paid', vehicle: 'KA-04-FF-1199' },
  { flat: 'B-101', block: 'B', floor: '1st', owner: 'Kunal Kapoor', phone: '9877002211', status: 'Occupied', dues: 'Paid', vehicle: 'KA-02-HH-7788' },
  { flat: 'B-201', block: 'B', floor: '2nd', owner: 'R. K. Gupta', phone: '9833004455', status: 'Occupied', dues: 'Paid', vehicle: 'KA-05-JK-9911' },
  { flat: 'C-101', block: 'C', floor: '1st', owner: 'Ananya Roy', phone: '9822005566', status: 'Occupied', dues: 'Paid', vehicle: 'KA-03-LK-4433' },
  { flat: 'D-301', block: 'D', floor: '3rd', owner: 'T. N. Seshan', phone: '9811998877', status: 'Occupied', dues: 'Paid', vehicle: 'KA-01-MM-5566' },
  { flat: 'D-404', block: 'D', floor: '4th', owner: 'Vacant (For Sale)', phone: '-', status: 'Vacant', dues: 'None', vehicle: 'None' },
];

const GUARDS_ROSTER = [
  { name: 'Rajesh Kumar', badge: 'SEC-104', gate: 'Main Gate #1', shift: 'Day Shift (08:00 - 20:00)', phone: '+91 99000 11222', status: 'On Duty' },
  { name: 'Sunil Shinde', badge: 'SEC-105', gate: 'Service Gate #2', shift: 'Day Shift (08:00 - 20:00)', phone: '+91 99000 33444', status: 'On Duty' },
  { name: 'Vikram Singh', badge: 'SEC-106', gate: 'Night Perimeter', shift: 'Night Shift (20:00 - 08:00)', phone: '+91 99000 55666', status: 'Standby' },
];

export default function AdminHome({
  pendingRequests = [],
  activeVisitors = [],
  onApproveRequest,
  onDenyRequest,
  onOpenSOS,
  onOpenHelpdesk,
  onOpenVehicleFinder,
  currentUser,
}) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'visitors' | 'finances' | 'guards'
  const [flats, setFlats] = useState(DEFAULT_FLATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalFlats: 48,
    occupiedFlats: 42,
    totalCollected: 156800,
    totalPending: 28450,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminOverview();
      if (data && data.flats) {
        setFlats(data.flats);
        setStats({
          totalFlats: data.totalFlats || 48,
          occupiedFlats: data.occupiedFlats || 42,
          totalCollected: data.totalCollected || 156800,
          totalPending: data.totalPending || 28450,
        });
      }
    } catch (e) {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter flats by search query and block
  const filteredFlats = flats.filter((f) => {
    const matchesBlock = blockFilter === 'ALL' || f.block === blockFilter || (blockFilter === 'UNPAID' && f.dues === 'Unpaid');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      f.flat.toLowerCase().includes(q) ||
      f.owner.toLowerCase().includes(q) ||
      f.phone.includes(q) ||
      f.vehicle.toLowerCase().includes(q);
    return matchesBlock && matchesSearch;
  });

  const handleCall = (phone) => {
    if (phone && phone !== '-') {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Phone Call', `Dialing ${phone}`);
      });
    }
  };

  const handleSendReminder = (flatNo, owner) => {
    Alert.alert(
      'Payment Reminder Sent',
      `Digital SMS and WhatsApp payment reminder dispatched to ${owner} for Flat ${flatNo} (₹4,250 pending dues).`
    );
  };

  const handleBroadcastAnnouncement = () => {
    Alert.prompt
      ? Alert.prompt(
          'Broadcast Society Notice',
          'Send emergency or general announcement to all 48 flat owners:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Broadcast',
              onPress: (text) =>
                Alert.alert('Broadcast Sent', `Notice delivered to all 48 resident flats: "${text || 'Urgent Notice from Society Admin'}"`),
            },
          ]
        )
      : Alert.alert(
          'Society Announcement',
          'Broadcasting to all 48 flats: "Water tank cleaning scheduled for tomorrow 10 AM - 2 PM."',
          [{ text: 'OK' }]
        );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. Executive Estate Admin Hero Banner */}
      <View style={styles.adminHero}>
        <View style={styles.heroTopRow}>
          <View style={styles.adminIconBox}>
            <Ionicons name="business" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>FULL SOCIETY MANAGEMENT</Text>
              </View>
              <View style={styles.liveIndicator}>
                <View style={styles.greenDot} />
                <Text style={styles.liveText}>SYSTEM LIVE</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Emerald Heights Residency</Text>
            <Text style={styles.heroSubtitle}>
              Estate Administrator: {currentUser?.name || 'Col. R. S. Rathore'} • 48 Flats Central Control
            </Text>
          </View>
        </View>

        {/* Quick Admin Actions Row */}
        <View style={styles.adminActionRow}>
          <TouchableOpacity style={styles.adminBtn} onPress={handleBroadcastAnnouncement} activeOpacity={0.8}>
            <Ionicons name="megaphone" size={15} color="#38BDF8" />
            <Text style={styles.adminBtnText}>Broadcast Notice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminBtn} onPress={onOpenVehicleFinder} activeOpacity={0.8}>
            <Ionicons name="car-sport" size={15} color="#FBBF24" />
            <Text style={styles.adminBtnText}>Vehicle Finder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminBtn} onPress={onOpenHelpdesk} activeOpacity={0.8}>
            <Ionicons name="build" size={15} color="#34D399" />
            <Text style={styles.adminBtnText}>Helpdesk (4)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
            onPress={onOpenSOS}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle" size={15} color="#F87171" />
            <Text style={[styles.adminBtnText, { color: '#F87171' }]}>SOS Alert</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Society-Wide KPI Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Total Society Flats</Text>
            <Ionicons name="home" size={16} color="#38BDF8" />
          </View>
          <Text style={styles.metricValue}>{stats.totalFlats}</Text>
          <Text style={styles.metricSub}>
            <Text style={{ color: colors.success, fontWeight: '700' }}>{stats.occupiedFlats} Occupied</Text> • 6 Vacant
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Active on Campus</Text>
            <Ionicons name="people" size={16} color="#34D399" />
          </View>
          <Text style={styles.metricValue}>{activeVisitors.length || 1}</Text>
          <Text style={styles.metricSub}>Visitors inside gates</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Maintenance Collected</Text>
            <Ionicons name="cash" size={16} color="#FBBF24" />
          </View>
          <Text style={[styles.metricValue, { fontSize: 18 }]}>₹{stats.totalCollected.toLocaleString()}</Text>
          <Text style={styles.metricSub}>
            Pending: <Text style={{ color: colors.danger, fontWeight: '700' }}>₹{stats.totalPending.toLocaleString()}</Text>
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Security Gate Status</Text>
            <Ionicons name="shield-checkmark" size={16} color="#A78BFA" />
          </View>
          <Text style={styles.metricValue}>2 Gates</Text>
          <Text style={styles.metricSub}>Main & Service Active</Text>
        </View>
      </View>

      {/* 3. Section Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'directory' && styles.tabItemActive]}
          onPress={() => setActiveTab('directory')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="layers"
            size={16}
            color={activeTab === 'directory' ? '#FFFFFF' : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'directory' && styles.tabTextActive]}>
            Flats Directory ({flats.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'visitors' && styles.tabItemActive]}
          onPress={() => setActiveTab('visitors')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="walk"
            size={16}
            color={activeTab === 'visitors' ? '#FFFFFF' : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'visitors' && styles.tabTextActive]}>
            Gate Visitors ({pendingRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'guards' && styles.tabItemActive]}
          onPress={() => setActiveTab('guards')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="shield-half"
            size={16}
            color={activeTab === 'guards' ? '#FFFFFF' : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'guards' && styles.tabTextActive]}>
            Guards Roster (3)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Tab 1: All 48 Flats Directory */}
      {activeTab === 'directory' && (
        <View style={styles.sectionContainer}>
          {/* Search Box */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Flat #, Owner name, Phone, or Car plate..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Block Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {['ALL', 'A', 'B', 'C', 'D', 'UNPAID'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, blockFilter === f && styles.filterPillActive]}
                onPress={() => setBlockFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, blockFilter === f && styles.filterPillTextActive]}>
                  {f === 'ALL' ? 'All Flats' : f === 'UNPAID' ? '⚠️ Unpaid Dues' : `Block ${f}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Flats List */}
          <View style={styles.flatsList}>
            {filteredFlats.map((item) => (
              <View key={item.flat} style={styles.flatCard}>
                <View style={styles.flatCardHeader}>
                  <View style={styles.flatBadge}>
                    <Text style={styles.flatBadgeNumber}>{item.flat}</Text>
                    <Text style={styles.flatBadgeBlock}>Block {item.block} • {item.floor}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View
                      style={[
                        styles.duesBadge,
                        item.dues === 'Paid' ? styles.duesPaid : styles.duesUnpaid,
                      ]}
                    >
                      <Text
                        style={[
                          styles.duesText,
                          item.dues === 'Paid' ? styles.duesTextPaid : styles.duesTextUnpaid,
                        ]}
                      >
                        {item.dues === 'Paid' ? 'Dues Paid' : 'Unpaid (₹4,250)'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Resident Details */}
                <View style={styles.flatDetailsRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ownerName}>{item.owner}</Text>
                    <Text style={styles.ownerPhone}>
                      <Ionicons name="call-outline" size={12} color={colors.textMuted} /> {item.phone}
                    </Text>
                  </View>

                  <View style={styles.vehicleBox}>
                    <Ionicons name="car-outline" size={14} color="#FBBF24" />
                    <Text style={styles.vehiclePlate}>{item.vehicle}</Text>
                  </View>
                </View>

                {/* Quick Flat Actions */}
                <View style={styles.flatActionsRow}>
                  <TouchableOpacity
                    style={styles.flatActionBtn}
                    onPress={() => handleCall(item.phone)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={13} color={colors.primary} />
                    <Text style={styles.flatActionBtnText}>Call Resident</Text>
                  </TouchableOpacity>

                  {item.dues === 'Unpaid' && (
                    <TouchableOpacity
                      style={[styles.flatActionBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
                      onPress={() => handleSendReminder(item.flat, item.owner)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="notifications-outline" size={13} color={colors.danger} />
                      <Text style={[styles.flatActionBtnText, { color: colors.danger }]}>Remind Dues</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 5. Tab 2: Gate Visitors Approvals */}
      {activeTab === 'visitors' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Society Gate Approvals ({pendingRequests.length} Waiting)
          </Text>
          <Text style={styles.sectionSub}>
            Visitors arriving at society security gates for any flat. Admin has society-wide override permissions.
          </Text>

          {pendingRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={42} color={colors.success} />
              <Text style={styles.emptyTitle}>All Gates Clear</Text>
              <Text style={styles.emptySub}>No visitors are currently waiting at society gates.</Text>
            </View>
          ) : (
            pendingRequests.map((req) => (
              <View key={req.id} style={styles.visitorCard}>
                <View style={styles.visitorCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.visitorName}>{req.name}</Text>
                      <View style={styles.visitorTypeBadge}>
                        <Text style={styles.visitorTypeText}>{req.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.visitorTargetFlat}>
                      Destination: <Text style={{ color: colors.primary, fontWeight: '800' }}>Flat {req.flat}</Text> • {req.gate || 'Main Gate 1'}
                    </Text>
                    <Text style={styles.visitorPurpose}>{req.purpose}</Text>
                  </View>
                </View>

                <View style={styles.visitorActions}>
                  <TouchableOpacity
                    style={[styles.vBtn, styles.vBtnDeny]}
                    onPress={() => onDenyRequest(req.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={15} color="#FFFFFF" />
                    <Text style={styles.vBtnText}>Deny Entry</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.vBtn, styles.vBtnApprove]}
                    onPress={() => onApproveRequest(req.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                    <Text style={styles.vBtnText}>Admin Allow Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 6. Tab 3: Security Guards & Staff Roster */}
      {activeTab === 'guards' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Society Security & Facility Staff Roster</Text>
          <Text style={styles.sectionSub}>
            Live surveillance and active duty assignments across Emerald Heights gates.
          </Text>

          {GUARDS_ROSTER.map((g) => (
            <View key={g.badge} style={styles.guardCard}>
              <View style={styles.guardCardHeader}>
                <View style={styles.guardAvatar}>
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.guardName}>{g.name}</Text>
                    <View style={styles.onDutyTag}>
                      <Text style={styles.onDutyText}>{g.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.guardGate}>Badge: {g.badge} • Assigned: {g.gate}</Text>
                  <Text style={styles.guardShift}>{g.shift}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.guardCallBtn}
                onPress={() => handleCall(g.phone)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={14} color="#FFFFFF" />
                <Text style={styles.guardCallText}>Call Gate Officer ({g.phone})</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071630',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  adminHero: {
    backgroundColor: '#0F2D6B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  adminIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  adminBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  adminBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#0C234E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0A1C3C',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0C234E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    padding: 0,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterPillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#071630',
  },
  flatsList: {
    gap: 10,
  },
  flatCard: {
    backgroundColor: '#0C234E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  flatCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flatBadgeNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#38BDF8',
  },
  flatBadgeBlock: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  duesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  duesPaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  duesUnpaid: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  duesText: {
    fontSize: 10,
    fontWeight: '800',
  },
  duesTextPaid: {
    color: '#34D399',
  },
  duesTextUnpaid: {
    color: '#F87171',
  },
  flatDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ownerPhone: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  vehicleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vehiclePlate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  flatActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  flatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  flatActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 4,
  },
  emptyState: {
    backgroundColor: '#0C234E',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  visitorCard: {
    backgroundColor: '#0C234E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  visitorCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visitorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  visitorTypeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  visitorTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  visitorTargetFlat: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  visitorPurpose: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  visitorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  vBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  vBtnDeny: {
    backgroundColor: '#DC2626',
  },
  vBtnApprove: {
    backgroundColor: '#16A34A',
  },
  vBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guardCard: {
    backgroundColor: '#0C234E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  guardCardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  guardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onDutyTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  onDutyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  guardGate: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
    fontWeight: '600',
  },
  guardShift: {
    fontSize: 10,
    color: '#94A3B8',
  },
  guardCallBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  guardCallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
