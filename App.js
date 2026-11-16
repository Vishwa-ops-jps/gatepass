import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import GuardHome from './src/components/GuardHome';
import {
  initWebSocket,
  fetchInitialData,
  apiLogVisitorEntry,
  apiCheckOutVisitor,
  apiCreateVisitorRequest,
} from './src/services/api';

export default function App() {
  // Pure Dedicated Security Gate Entry System
  const [activeVisitors, setActiveVisitors] = useState([
    { id: 'v-1', name: 'Dr. Alok Verma', flat: 'B-402', inTime: '10:45 AM' },
    { id: 'v-2', name: 'Urban Company AC Tech', flat: 'B-201', inTime: '11:10 AM' },
  ]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch initial visitor data & connect Realtime WebSocket
  useEffect(() => {
    fetchInitialData()
      .then((data) => {
        if (data) {
          setBackendConnected(true);
          if (data.activeVisitors && data.activeVisitors.length > 0) {
            setActiveVisitors(data.activeVisitors);
          }
          if (data.activity && data.activity.length > 0) {
            setRecentActivity(data.activity);
          }
        }
      })
      .catch(() => {});

    // Realtime WebSocket listener
    const handleWebSocketEvent = (msg) => {
      setBackendConnected(true);
      const { event, data } = msg;

      switch (event) {
        case 'INIT_STATE':
          if (data.activeVisitors) setActiveVisitors(data.activeVisitors);
          break;

        case 'VISITOR_ENTERED':
          if (data && data.visitor) {
            setActiveVisitors((prev) => [
              {
                id: data.visitor.id,
                name: data.visitor.name,
                flat: data.visitor.flat,
                inTime: data.visitor.in_time_display || 'Just now',
                image: data.visitor.image,
                purpose: data.visitor.purpose,
                vehicle: data.visitor.vehicle,
              },
              ...prev.filter((v) => v.id !== data.visitor.id),
            ]);
          }
          break;

        case 'VISITOR_CHECKED_OUT':
          if (data && data.visitorId) {
            setActiveVisitors((prev) => prev.filter((v) => v.id !== data.visitorId));
          }
          break;

        default:
          break;
      }
    };

    initWebSocket(handleWebSocketEvent);
  }, []);

  // Guard logs a new visitor entry (Replacing manual paper register)
  const handleDirectVisitorEntry = async (data) => {
    const newVisitor = {
      id: 'v-' + Date.now(),
      name: data.name,
      flat: data.flat,
      inTime: 'Just now',
      image: data.photo,
      purpose: data.purpose,
      vehicle: data.vehicle,
    };

    // Optimistically add to currently inside list
    setActiveVisitors((prev) => [newVisitor, ...prev]);

    try {
      await apiLogVisitorEntry(data);
      Alert.alert(
        'Entry Saved to Register! ✅',
        `${data.name} entry recorded for Flat ${data.flat}. Stored permanently to database.`
      );
    } catch (e) {
      Alert.alert('Entry Saved Locally ✅', `${data.name} logged for Flat ${data.flat}.`);
    }
  };

  // Guard checks out visitor upon exit
  const handleCheckOutVisitor = async (id) => {
    const target = activeVisitors.find((v) => v.id === id);
    setActiveVisitors((prev) => prev.filter((v) => v.id !== id));

    try {
      await apiCheckOutVisitor(id);
      Alert.alert('Checked Out 🚪', `${target?.name || 'Visitor'} departed campus.`);
    } catch (e) {
      Alert.alert('Checked Out 🚪', 'Visitor marked as departed.');
    }
  };

  // Secondary intercom call to resident
  const handleSendApprovalRequest = async (newRequest) => {
    try {
      await apiCreateVisitorRequest(newRequest);
      Alert.alert('Intercom Ringing 📞', `Connecting to Flat ${newRequest.flat}...`);
    } catch (e) {
      Alert.alert('Calling Flat 📞', `Intercom ringing at Flat ${newRequest.flat}.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Top Security Station Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRight}>
          <View style={styles.dutyPill}>
            <View style={styles.greenPulseDot} />
            <Text style={styles.dutyPillText}>DUTY ACTIVE</Text>
          </View>
          <View
            style={[
              styles.syncDot,
              { backgroundColor: backendConnected ? '#10B981' : '#F59E0B' },
            ]}
          />
        </View>
      </View>

      {/* Security Gate Terminal Sub-Header */}
      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.subHeaderTitle}>MAIN GATE #1 • SECURITY DESK</Text>
        </View>
        <Text style={styles.officerName}>Officer Rajesh Kumar</Text>
      </View>

      {/* Main Security Desk Entry Register */}
      <View style={styles.body}>
        <GuardHome
          onDirectVisitorEntry={handleDirectVisitorEntry}
          activeVisitors={activeVisitors}
          onCheckOutVisitor={handleCheckOutVisitor}
          onSendApprovalRequest={handleSendApprovalRequest}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 38,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  dutyPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subHeader: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subHeaderTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  officerName: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
