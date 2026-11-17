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
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GuardHome from './src/components/GuardHome';
import {
  initWebSocket,
  fetchInitialData,
  apiLogVisitorEntry,
  apiCheckOutVisitor,
  apiCreateVisitorRequest,
  apiGetAllVisitors,
  BACKEND_URL,
} from './src/services/api';

export default function App() {
  // Pure Dedicated Security Gate Entry System
  const [activeVisitors, setActiveVisitors] = useState([
    { id: 'v-1', name: 'Dr. Alok Verma', flat: 'B-402', inTime: '10:45 AM', purpose: 'Visit / Relative' },
    { id: 'v-2', name: 'Urban Company AC Tech', flat: 'B-201', inTime: '11:10 AM', purpose: 'AC Repair' },
  ]);
  const [historicalVisitors, setHistoricalVisitors] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchInitialData();
      if (data) {
        setBackendConnected(true);
        if (data.activeVisitors && data.activeVisitors.length > 0) {
          setActiveVisitors(data.activeVisitors);
        }
      }
      const history = await apiGetAllVisitors();
      if (history && history.length > 0) {
        setHistoricalVisitors(history);
      }
    } catch (e) {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadData();

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
            const newVis = {
              id: data.visitor.id,
              name: data.visitor.name,
              flat: data.visitor.flat,
              inTime: data.visitor.in_time_display || 'Just now',
              image: data.visitor.image,
              purpose: data.visitor.purpose,
              vehicle: data.visitor.vehicle,
              status: 'Inside',
            };
            setActiveVisitors((prev) => [newVis, ...prev.filter((v) => v.id !== newVis.id)]);
            setHistoricalVisitors((prev) => [newVis, ...prev.filter((v) => v.id !== newVis.id)]);
          }
          break;

        case 'VISITOR_CHECKED_OUT':
          if (data && data.visitorId) {
            setActiveVisitors((prev) => prev.filter((v) => v.id !== data.visitorId));
            setHistoricalVisitors((prev) =>
              prev.map((v) =>
                v.id === data.visitorId
                  ? { ...v, status: 'Departed', out_time_display: data.outTime || 'Just now' }
                  : v
              )
            );
          }
          break;

        default:
          break;
      }
    };

    initWebSocket(handleWebSocketEvent);
  }, []);

  // Export to Excel / CSV Handler
  const handleExportExcel = async () => {
    const exportUrl = `${BACKEND_URL}/api/visitors/export`;
    try {
      const supported = await Linking.canOpenURL(exportUrl);
      if (supported) {
        await Linking.openURL(exportUrl);
      } else {
        Alert.alert('Export Excel Link', `Open in your phone browser:\n${exportUrl}`);
      }
    } catch (err) {
      Alert.alert('Excel Export', `Opening export in browser:\n${exportUrl}`);
      Linking.openURL(exportUrl).catch(() => {});
    }
  };

  // Guard logs a new visitor entry
  const handleDirectVisitorEntry = async (data) => {
    const newVisitor = {
      id: 'v-' + Date.now(),
      name: data.name,
      flat: data.flat,
      inTime: 'Just now',
      image: data.photo,
      purpose: data.purpose,
      vehicle: data.vehicle,
      status: 'Inside',
    };

    setActiveVisitors((prev) => [newVisitor, ...prev]);
    setHistoricalVisitors((prev) => [newVisitor, ...prev]);

    try {
      await apiLogVisitorEntry(data);
      Alert.alert(
        'Entry Recorded! ✅',
        `${data.name} entry logged for Flat ${data.flat}. Saved permanently.`
      );
    } catch (e) {
      Alert.alert('Entry Saved Locally ✅', `${data.name} logged for Flat ${data.flat}.`);
    }
  };

  // Guard checks out visitor upon exit
  const handleCheckOutVisitor = async (id) => {
    const target = activeVisitors.find((v) => v.id === id);
    setActiveVisitors((prev) => prev.filter((v) => v.id !== id));
    setHistoricalVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Departed', out_time_display: 'Just now' } : v))
    );

    try {
      await apiCheckOutVisitor(id);
      Alert.alert('Checked Out 🚪', `${target?.name || 'Visitor'} marked as departed.`);
    } catch (e) {
      Alert.alert('Checked Out 🚪', 'Visitor marked as departed.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" translucent={false} />

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
          {/* Export Excel Button in Header */}
          <TouchableOpacity
            style={styles.btnHeaderExcel}
            onPress={handleExportExcel}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={13} color="#34D399" />
            <Text style={styles.btnHeaderExcelText}>Export Excel</Text>
          </TouchableOpacity>

          {/* Duty Active Status Pill */}
          <View style={styles.dutyPill}>
            <View style={styles.greenPulseDot} />
            <Text style={styles.dutyPillText}>DUTY ACTIVE</Text>
          </View>
        </View>
      </View>

      {/* Security Gate Terminal Sub-Header (Clean Stack to Prevent Overlap) */}
      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
          <Text style={styles.subHeaderTitle} numberOfLines={1}>MAIN GATE #1 • VISITOR DESK</Text>
        </View>
        <View style={styles.officerBadge}>
          <Text style={styles.officerName} numberOfLines={1}>Officer Rajesh Kumar</Text>
        </View>
      </View>

      {/* Main Security Desk Entry Register */}
      <View style={styles.body}>
        <GuardHome
          onDirectVisitorEntry={handleDirectVisitorEntry}
          activeVisitors={activeVisitors}
          historicalVisitors={historicalVisitors}
          onCheckOutVisitor={handleCheckOutVisitor}
          onExportExcel={handleExportExcel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 32,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnHeaderExcel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  btnHeaderExcelText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  dutyPillText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subHeader: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  subHeaderTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  officerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  officerName: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
});
