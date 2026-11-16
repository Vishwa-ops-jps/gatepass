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
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import {
  apiGetAdminOverview,
  apiOnboardResident,
  apiDeleteResident,
  apiTriggerSOS,
} from '../services/api';

const DEFAULT_FLATS = [
  { id: 'flat-B402', flat: 'B-402', block: 'B', floor: '4th', owner: 'Vishwa (Resident Owner)', phone: '9876543210', email: 'vishwa@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Unpaid', duesAmount: 4250, vehicle: 'KA-05-MM-9214' },
  { id: 'flat-A104', flat: 'A-104', block: 'A', floor: '1st', owner: 'Pooja Malhotra', phone: '9811122233', email: 'pooja@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Unpaid', duesAmount: 3600, vehicle: 'KA-03-MG-4120' },
  { id: 'flat-C201', flat: 'C-201', block: 'C', floor: '2nd', owner: 'Dr. Alok Verma', phone: '9822233445', email: 'alok@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4100, vehicle: 'KA-51-AB-8800' },
  { id: 'flat-A101', flat: 'A-101', block: 'A', floor: '1st', owner: 'Suresh Raina', phone: '9811100223', email: 'suresh@residence.com', status: 'Occupied', ownershipType: 'Tenant', dues: 'Paid', duesAmount: 3600, vehicle: 'KA-01-EE-3312' },
  { id: 'flat-A202', flat: 'A-202', block: 'A', floor: '2nd', owner: 'Meera Sen', phone: '9844001122', email: 'meera@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 3800, vehicle: 'KA-04-FF-1199' },
  { id: 'flat-B101', flat: 'B-101', block: 'B', floor: '1st', owner: 'Kunal Kapoor', phone: '9877002211', email: 'kunal@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4250, vehicle: 'KA-02-HH-7788' },
  { id: 'flat-B201', flat: 'B-201', block: 'B', floor: '2nd', owner: 'R. K. Gupta', phone: '9833004455', email: 'rkgupta@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4250, vehicle: 'KA-05-JK-9911' },
  { id: 'flat-C101', flat: 'C-101', block: 'C', floor: '1st', owner: 'Ananya Roy', phone: '9822005566', email: 'ananya@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4100, vehicle: 'KA-03-LK-4433' },
  { id: 'flat-D301', flat: 'D-301', block: 'D', floor: '3rd', owner: 'T. N. Seshan', phone: '9811998877', email: 'seshan@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4500, vehicle: 'KA-01-MM-5566' },
  { id: 'flat-D404', flat: 'D-404', block: 'D', floor: '4th', owner: 'Vacant (For Sale)', phone: '-', email: '', status: 'Vacant', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 0, vehicle: 'None' },
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
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'visitors' | 'guards'
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

  // Onboarding Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newFlatNo, setNewFlatNo] = useState('');
  const [newBlock, setNewBlock] = useState('B');
  const [newFloor, setNewFloor] = useState('3rd');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnershipType, setNewOwnershipType] = useState('Owner Occupied');
  const [newVehicle, setNewVehicle] = useState('');
  const [newDuesAmount, setNewDuesAmount] = useState('4250');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminOverview();
      if (data && data.flats) {
        setFlats(data.flats);
        setStats({
          totalFlats: data.totalFlats || Math.max(48, data.flats.length),
          occupiedFlats: data.occupiedFlats || data.flats.filter((f) => f.status === 'Occupied').length,
          totalCollected: data.finance?.totalCollected || 156800,
          totalPending: data.finance?.totalPending || 28450,
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
          'Send emergency or general announcement to all flat owners:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Broadcast',
              onPress: (text) =>
                Alert.alert('Broadcast Sent', `Notice delivered to resident units: "${text || 'Urgent Notice from Society Admin'}"`),
            },
          ]
        )
      : Alert.alert(
          'Society Announcement',
          'Broadcasting to all registered flats: "Water tank cleaning scheduled for tomorrow 10 AM - 2 PM."',
          [{ text: 'OK' }]
        );
  };

  // Submit Onboard Resident Form
  const handleOnboardResident = async () => {
    const flatClean = newFlatNo.trim().toUpperCase();
    const ownerClean = newOwnerName.trim();
    const phoneClean = newOwnerPhone.trim();

    if (!flatClean) {
      Alert.alert('Required', 'Please enter Flat Number (e.g. B-501 or A-302)');
      return;
    }
    if (!ownerClean) {
      Alert.alert('Required', 'Please enter Resident Owner Full Name');
      return;
    }
    if (!phoneClean || phoneClean.length < 10) {
      Alert.alert('Required', 'Please enter valid 10-digit registered mobile number');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiOnboardResident({
        flat: flatClean,
        block: newBlock,
        floor: newFloor,
        owner: ownerClean,
        phone: phoneClean,
        email: newOwnerEmail.trim(),
        ownershipType: newOwnershipType,
        vehicle: newVehicle.trim().toUpperCase() || 'None',
        duesAmount: Number(newDuesAmount) || 4250,
        status: 'Occupied',
        dues: 'Unpaid',
      });

      setSubmitting(false);
      setModalVisible(false);

      // Reset Form
      setNewFlatNo('');
      setNewOwnerName('');
      setNewOwnerPhone('');
      setNewOwnerEmail('');
      setNewVehicle('');

      // Refresh list
      loadData();

      Alert.alert(
        'Resident Owner Onboarded! 🎉',
        `Flat ${flatClean} has been registered to ${ownerClean}.\n\nThe resident can now log in using:\n• Flat: ${flatClean}\n• Phone: ${phoneClean}`
      );
    } catch (err) {
      setSubmitting(false);
      // Fallback local addition if offline
      const newEntry = {
        id: 'flat-' + flatClean,
        flat: flatClean,
        block: newBlock,
        floor: newFloor,
        owner: ownerClean,
        phone: phoneClean,
        email: newOwnerEmail,
        status: 'Occupied',
        ownershipType: newOwnershipType,
        dues: 'Unpaid',
        duesAmount: Number(newDuesAmount) || 4250,
        vehicle: newVehicle || 'None',
      };
      setFlats((prev) => [newEntry, ...prev]);
      setModalVisible(false);
      Alert.alert(
        'Resident Registered',
        `Flat ${flatClean} (${ownerClean}) registered to society directory.\nResident login: ${flatClean} / ${phoneClean}`
      );
    }
  };

  // Delete / Offboard Resident
  const handleDeleteResident = (flatNo, owner) => {
    Alert.alert(
      'Offboard Resident Unit',
      `Are you sure you want to remove ${owner} (Flat ${flatNo}) from the society registry? The resident will no longer be able to log in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteResident(flatNo);
              setFlats((prev) => prev.filter((f) => f.flat !== flatNo));
              Alert.alert('Unit Removed', `Flat ${flatNo} has been removed from the registry.`);
            } catch (e) {
              setFlats((prev) => prev.filter((f) => f.flat !== flatNo));
            }
          },
        },
      ]
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
              Estate Administrator: {currentUser?.name || 'Col. R. S. Rathore'} • {stats.totalFlats} Flats Central Control
            </Text>
          </View>
        </View>

        {/* Quick Admin Actions Row */}
        <View style={styles.adminActionRow}>
          <TouchableOpacity
            style={[styles.adminBtn, { backgroundColor: '#2563EB', borderColor: '#3B82F6' }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={15} color="#FFFFFF" />
            <Text style={[styles.adminBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>+ Add Resident</Text>
          </TouchableOpacity>

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
            <Text style={{ color: colors.success, fontWeight: '700' }}>{stats.occupiedFlats} Occupied</Text> • {stats.totalFlats - stats.occupiedFlats} Vacant
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

      {/* 4. Tab 1: All Flats Directory */}
      {activeTab === 'directory' && (
        <View style={styles.sectionContainer}>
          {/* Header Row with Add Resident Button */}
          <View style={styles.directoryHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Apartment Units & Residents</Text>
              <Text style={styles.sectionSub}>Only registered residents can log in to their flat</Text>
            </View>
            <TouchableOpacity
              style={styles.onboardPillBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.onboardPillBtnText}>Onboard Resident</Text>
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Flat # (e.g. B-402), Owner Name, or Phone..."
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
                        {item.dues === 'Paid' ? 'Dues Paid' : `Unpaid (₹${item.duesAmount || 4250})`}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>
                      {item.ownershipType || 'Owner Occupied'}
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
                    {item.email ? (
                      <Text style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>
                        <Ionicons name="mail-outline" size={10} color="#64748B" /> {item.email}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.vehicleBox}>
                    <Ionicons name="car-outline" size={14} color="#FBBF24" />
                    <Text style={styles.vehiclePlate}>{item.vehicle || 'No Car'}</Text>
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

                  <TouchableOpacity
                    style={[styles.flatActionBtn, { borderColor: 'rgba(239, 68, 68, 0.25)', backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}
                    onPress={() => handleDeleteResident(item.flat, item.owner)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={13} color="#F87171" />
                    <Text style={[styles.flatActionBtnText, { color: '#F87171' }]}>Remove</Text>
                  </TouchableOpacity>
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

      {/* 7. Modal: Onboard New Resident Owner */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Onboard Resident Owner</Text>
                <Text style={styles.modalSubtitle}>Register apartment unit to grant resident access</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Flat Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. B-501 or A-302"
                  placeholderTextColor={colors.textMuted}
                  value={newFlatNo}
                  onChangeText={setNewFlatNo}
                  autoCapitalize="characters"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Block / Wing *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Block B"
                    placeholderTextColor={colors.textMuted}
                    value={newBlock}
                    onChangeText={setNewBlock}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Floor</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="3rd Floor"
                    placeholderTextColor={colors.textMuted}
                    value={newFloor}
                    onChangeText={setNewFloor}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Resident Owner Full Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Rohan Sharma"
                  placeholderTextColor={colors.textMuted}
                  value={newOwnerName}
                  onChangeText={setNewOwnerName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Registered Mobile Number (Login Key) *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 9812345678"
                  placeholderTextColor={colors.textMuted}
                  value={newOwnerPhone}
                  onChangeText={setNewOwnerPhone}
                  keyboardType="phone-pad"
                />
                <Text style={{ fontSize: 10, color: '#38BDF8', marginTop: 2 }}>
                  * The resident will use this phone number + flat number to log in.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Email Address (Invoicing & Passes)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. rohan@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  value={newOwnerEmail}
                  onChangeText={setNewOwnerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Ownership Type</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Owner Occupied / Tenant"
                    placeholderTextColor={colors.textMuted}
                    value={newOwnershipType}
                    onChangeText={setNewOwnershipType}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Car Plate #</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. KA-04-AB-1234"
                    placeholderTextColor={colors.textMuted}
                    value={newVehicle}
                    onChangeText={setNewVehicle}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Monthly Maintenance Fee (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="4250"
                  placeholderTextColor={colors.textMuted}
                  value={newDuesAmount}
                  onChangeText={setNewDuesAmount}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleOnboardResident}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.modalSubmitBtnText}>Register Flat & Create Login</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    flexWrap: 'wrap',
  },
  adminBtn: {
    flex: 1,
    minWidth: '28%',
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
  directoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onboardPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  onboardPillBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
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
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0A1C3C',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#071533',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 14,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
