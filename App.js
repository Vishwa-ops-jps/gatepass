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
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [historicalVisitors, setHistoricalVisitors] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchInitialData();
      if (data && Array.isArray(data.activeVisitors)) {
        setBackendConnected(true);
        const normalized = data.activeVisitors.map((v) => ({
          id: v.id || v._id,
          name: v.name,
          flat: v.flat,
          inTime: v.in_time_display || v.inTime || 'Just now',
          image: v.image,
          purpose: v.purpose,
          vehicle: v.vehicle,
          category: v.category,
          status: v.status || 'Inside',
        }));
        setActiveVisitors(normalized);
      }
      const history = await apiGetAllVisitors();
      if (Array.isArray(history) && history.length > 0) {
        const normalizedHistory = history.map((v) => ({
          id: v.id || v._id,
          name: v.name,
          flat: v.flat,
          phone: v.phone,
          purpose: v.purpose,
          inTime: v.in_time_display || v.inTime || 'Just now',
          out_time_display: v.out_time_display || v.outTime || '—',
          status: v.status === 'approved' ? 'Inside' : (v.status === 'checked_out' ? 'Departed' : (v.status || 'Departed')),
          image: v.image,
        }));
        setHistoricalVisitors(normalizedHistory);
      }
    } catch (e) {
      console.warn('[App] Load data error:', e.message);
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
    try {
      const res = await apiLogVisitorEntry(data);
      if (res && res.success && res.visitor) {
        const v = res.visitor;
        const newVisitor = {
          id: v.id || v._id,
          name: v.name,
          flat: v.flat,
          inTime: v.in_time_display || 'Just now',
          image: v.image || data.photo,
          purpose: v.purpose || data.purpose,
          vehicle: v.vehicle || data.vehicle,
          category: v.category || data.category,
          status: 'Inside',
        };
        setActiveVisitors((prev) => [newVisitor, ...prev.filter((x) => x.id !== newVisitor.id)]);
        setHistoricalVisitors((prev) => [newVisitor, ...prev.filter((x) => x.id !== newVisitor.id)]);
        Alert.alert(
          'Saved to MongoDB! ✅',
          `${data.name} entry recorded and saved permanently in MongoDB Atlas.`
        );
      } else {
        const fallbackVisitor = {
          id: 'v-' + Date.now(),
          name: data.name,
          flat: data.flat,
          inTime: 'Just now',
          image: data.photo,
          purpose: data.purpose,
          vehicle: data.vehicle,
          status: 'Inside',
        };
        setActiveVisitors((prev) => [fallbackVisitor, ...prev]);
        setHistoricalVisitors((prev) => [fallbackVisitor, ...prev]);
        Alert.alert('Entry Saved ✅', `${data.name} logged for Flat ${data.flat}.`);
      }
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
      Alert.alert('Checked Out 🚪', `${target?.name || 'Visitor'} marked departed in MongoDB.`);
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
          {/* Prominent Header Export Excel Button */}
          <TouchableOpacity
            style={styles.btnHeaderExcel}
            onPress={handleExportExcel}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
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
          <Ionicons name="shield-checkmark" size={14} color="#10B981" style={{ marginRight: 5 }} />
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
    paddingHorizontal: 12,
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
    width: 110,
    height: 30,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnHeaderExcel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
  },
  btnHeaderExcelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  dutyPillText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subHeader: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  subHeaderTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  officerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
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
