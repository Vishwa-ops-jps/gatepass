import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import Header from './src/components/Header';
import ResidentHome from './src/components/ResidentHome';
import GuardHome from './src/components/GuardHome';
import StaffTab from './src/components/StaffTab';
import AmenitiesTab from './src/components/AmenitiesTab';
import MaintenanceTab from './src/components/MaintenanceTab';
import QuickActionModal from './src/components/QuickActionModal';
import QRPassModal from './src/components/QRPassModal';
import SOSModal from './src/components/SOSModal';
import {
  initialPendingRequests,
  initialRecentActivity,
} from './src/data/mockData';

export default function App() {
  const [role, setRole] = useState('resident'); // 'resident' | 'guard'
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'staff' | 'amenities' | 'maintenance'

  // Application Data States
  const [pendingRequests, setPendingRequests] = useState(initialPendingRequests);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [activeVisitors, setActiveVisitors] = useState([
    { id: 'v-1', name: 'Dr. Alok Verma', flat: 'B-402', inTime: '10:45 AM' },
    { id: 'v-2', name: 'Urban Company AC Tech', flat: 'B-201', inTime: '11:10 AM' },
  ]);

  // Modal States
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState('guest');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentQRPass, setCurrentQRPass] = useState(null);
  const [sosModalVisible, setSosModalVisible] = useState(false);

  // Toggle between Resident and Guard Desk mode
  const handleToggleRole = () => {
    const nextRole = role === 'resident' ? 'guard' : 'resident';
    setRole(nextRole);
  };

  // Handle Resident Approving a Visitor
  const handleApproveRequest = (id, leaveAtGate = false) => {
    const target = pendingRequests.find((r) => r.id === id);
    if (!target) return;

    setPendingRequests((prev) => prev.filter((r) => r.id !== id));

    const newActivity = {
      id: 'act-' + Date.now(),
      name: target.name,
      role: target.type,
      category: target.category,
      time: 'Just now',
      gate: target.gate,
      action: leaveAtGate ? 'Left at Gate' : 'Allowed Entry',
      status: 'approved',
    };

    setRecentActivity((prev) => [newActivity, ...prev]);

    if (!leaveAtGate) {
      setActiveVisitors((prev) => [
        {
          id: 'v-' + Date.now(),
          name: target.name,
          flat: 'B-402',
          inTime: 'Just now',
        },
        ...prev,
      ]);
    }

    Alert.alert(
      leaveAtGate ? 'Parcel Kept at Gate' : 'Entry Approved!',
      `${target.name} has been notified and granted entry at ${target.gate}.`
    );
  };

  // Handle Resident Denying a Visitor
  const handleDenyRequest = (id) => {
    const target = pendingRequests.find((r) => r.id === id);
    if (!target) return;

    setPendingRequests((prev) => prev.filter((r) => r.id !== id));

    const newActivity = {
      id: 'act-' + Date.now(),
      name: target.name,
      role: target.type,
      category: target.category,
      time: 'Just now',
      gate: target.gate,
      action: 'Denied Entry',
      status: 'denied',
    };

    setRecentActivity((prev) => [newActivity, ...prev]);
    Alert.alert('Entry Denied', `${target.name} was denied access by Flat B-402.`);
  };

  // Handle Guard sending approval request to resident
  const handleSendApprovalRequest = (newRequest) => {
    setPendingRequests((prev) => [newRequest, ...prev]);
  };

  // Handle Guard checking out visitor
  const handleCheckOutVisitor = (id) => {
    const target = activeVisitors.find((v) => v.id === id);
    setActiveVisitors((prev) => prev.filter((v) => v.id !== id));
    if (target) {
      setRecentActivity((prev) => [
        {
          id: 'act-' + Date.now(),
          name: target.name,
          role: 'Visitor',
          category: 'guest',
          time: 'Just now',
          gate: 'Gate 1',
          action: 'Checked Out',
          status: 'completed',
        },
        ...prev,
      ]);
      Alert.alert('Checked Out', `${target.name} has exited the premises.`);
    }
  };

  // Pre-approve pass creation handler
  const handleCreatePass = (passData) => {
    setActionModalVisible(false);
    setCurrentQRPass(passData);
    setQrModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Top Header with GatePass Logo & Mode Switcher */}
      <Header
        role={role}
        onToggleRole={handleToggleRole}
        pendingCount={pendingRequests.length}
        onOpenNotifications={() => {
          Alert.alert(
            'GatePass Notifications',
            pendingRequests.length > 0
              ? `You have ${pendingRequests.length} visitor(s) waiting at the gate.`
              : 'No pending approvals right now.'
          );
        }}
      />

      {/* Main Body */}
      <View style={styles.body}>
        {role === 'guard' ? (
          <GuardHome
            onSendApprovalRequest={handleSendApprovalRequest}
            activeVisitors={activeVisitors}
            onCheckOutVisitor={handleCheckOutVisitor}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <ResidentHome
                pendingRequests={pendingRequests}
                recentActivity={recentActivity}
                onApproveRequest={handleApproveRequest}
                onDenyRequest={handleDenyRequest}
                onQuickAction={(type) => {
                  setActionType(type);
                  setActionModalVisible(true);
                }}
                onOpenSOS={() => setSosModalVisible(true)}
                onOpenQRModal={(pass) => {
                  setCurrentQRPass(pass);
                  setQrModalVisible(true);
                }}
              />
            )}
            {activeTab === 'staff' && <StaffTab />}
            {activeTab === 'amenities' && <AmenitiesTab />}
            {activeTab === 'maintenance' && <MaintenanceTab />}
          </>
        )}
      </View>

      {/* Resident Bottom Navigation Bar (Hidden in Guard Desk mode) */}
      {role === 'resident' && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'home' ? 'shield' : 'shield-outline'}
              size={22}
              color={activeTab === 'home' ? colors.secondary : colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'home' && styles.navTextActive,
              ]}
            >
              Security
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('staff')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'staff' ? 'people' : 'people-outline'}
              size={22}
              color={activeTab === 'staff' ? colors.secondary : colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'staff' && styles.navTextActive,
              ]}
            >
              Staff
            </Text>
          </TouchableOpacity>

          {/* Center GatePass Floating Action Button */}
          <TouchableOpacity
            style={styles.centerFab}
            onPress={() => {
              setActionType('guest');
              setActionModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.centerFabInner}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.centerFabText}>Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('amenities')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'amenities' ? 'grid' : 'grid-outline'}
              size={22}
              color={activeTab === 'amenities' ? colors.secondary : colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'amenities' && styles.navTextActive,
              ]}
            >
              Amenities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('maintenance')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'maintenance' ? 'receipt' : 'receipt-outline'}
              size={22}
              color={activeTab === 'maintenance' ? colors.secondary : colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'maintenance' && styles.navTextActive,
              ]}
            >
              Pay Dues
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <QuickActionModal
        visible={actionModalVisible}
        actionType={actionType}
        onClose={() => setActionModalVisible(false)}
        onCreatePass={handleCreatePass}
      />

      <QRPassModal
        visible={qrModalVisible}
        passData={currentQRPass}
        onClose={() => setQrModalVisible(false)}
      />

      <SOSModal
        visible={sosModalVisible}
        onClose={() => setSosModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    flex: 1,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  navTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  centerFab: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    flex: 1,
  },
  centerFabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  centerFabText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 2,
  },
});
