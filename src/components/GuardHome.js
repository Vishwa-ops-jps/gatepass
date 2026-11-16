import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { apiVerifyPasscode } from '../services/api';
import ScannerModal from './ScannerModal';

const QUICK_DELIVERY_TAGS = ['Zomato', 'Swiggy', 'Blinkit', 'Amazon', 'Zepto'];

const PRESET_PHOTOS = {
  guest: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  delivery: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  cab: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  service: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
};

export default function GuardHome({
  onSendApprovalRequest,
  onDirectVisitorEntry,
  activeVisitors,
  onCheckOutVisitor,
}) {
  const [flatNo, setFlatNo] = useState('B-402');
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('delivery');
  const [vehicleNo, setVehicleNo] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  // Take photo using device camera
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera Permission Required', 'Please enable camera access to take visitor photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setCapturedPhoto(photoData);
      }
    } catch (err) {
      Alert.alert('Camera Notice', 'Could not open camera viewfinder. Please verify device permissions.');
    }
  };

  // Upload photo from gallery
  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setCapturedPhoto(photoData);
      }
    } catch (err) {
      Alert.alert('Gallery Notice', 'Could not select photo.');
    }
  };

  const handleVerifyPasscode = async () => {
    if (!passcode) {
      Alert.alert('GatePass Verification', 'Please enter a 6-digit GatePass code');
      return;
    }
    try {
      const res = await apiVerifyPasscode(passcode);
      Alert.alert('Passcode Validated ✅', res.message || 'Passcode is valid. Entry granted!');
      setPasscode('');
    } catch (e) {
      Alert.alert('Verification Failed', e.message || 'Invalid or expired passcode.');
    }
  };

  const handleDirectCheckIn = () => {
    if (!flatNo) {
      Alert.alert('Required', 'Please enter destination flat number (e.g. B-402)');
      return;
    }
    const name = visitorName || (selectedCategory === 'delivery' ? 'Delivery Partner' : 'Visitor');
    const photo = capturedPhoto || PRESET_PHOTOS[selectedCategory] || PRESET_PHOTOS.guest;

    const payload = {
      name,
      flat: flatNo.toUpperCase(),
      phone: phone || '+91 98000 11222',
      purpose: selectedCategory === 'delivery' ? 'Delivery (Zomato/Swiggy)' : selectedCategory === 'cab' ? 'Cab (Uber/Ola)' : `Visiting Flat ${flatNo}`,
      category: selectedCategory,
      vehicle: vehicleNo ? vehicleNo.toUpperCase() : null,
      photo,
    };

    if (onDirectVisitorEntry) {
      onDirectVisitorEntry(payload);
    } else {
      Alert.alert('Entry Logged ✅', `${name} entry recorded for Flat ${flatNo}.`);
    }

    setVisitorName('');
    setPhone('');
    setVehicleNo('');
    setCapturedPhoto(null);
  };

  const handleSendRequest = () => {
    if (!flatNo) {
      Alert.alert('Required', 'Please enter destination flat number');
      return;
    }
    const name = visitorName || (selectedCategory === 'delivery' ? 'Delivery Partner' : 'Visitor');

    const newRequest = {
      id: 'req-' + Date.now(),
      name: name,
      phone: phone || '+91 99000 11222',
      type: selectedCategory === 'delivery' ? 'Delivery' : 'Guest',
      category: selectedCategory,
      vehicle: vehicleNo ? vehicleNo.toUpperCase() : null,
      gate: 'Main Gate 1',
      time: 'Just now',
      purpose: `Visiting Flat ${flatNo}`,
      flat: flatNo,
      status: 'pending',
      image: PRESET_PHOTOS[selectedCategory] || PRESET_PHOTOS.guest,
    };

    onSendApprovalRequest(newRequest);
    Alert.alert(
      'Calling Resident Flat! 📞',
      `Intercom ringing initiated at Flat ${flatNo} for ${name}. CCTV feed sent to resident.`
    );
    setVisitorName('');
    setPhone('');
    setVehicleNo('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Guard Status & Live Shift Banner */}
      <View style={styles.guardBanner}>
        <View style={styles.guardBannerLeft}>
          <View style={styles.shieldIconBox}>
            <Ionicons name="shield-checkmark" size={26} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.guardGateText}>SECURITY TERMINAL • GATE #1</Text>
            <Text style={styles.guardOfficerText}>Duty Guard: Rajesh Kumar</Text>
          </View>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveGreenDot} />
          <Text style={styles.liveText}>GATE ACTIVE</Text>
        </View>
      </View>

      {/* Guard Shift Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>48</Text>
          <Text style={styles.metricLabel}>Entries Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: colors.secondary }]}>
            {activeVisitors.length}
          </Text>
          <Text style={styles.metricLabel}>Inside Now</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: colors.success }]}>16</Text>
          <Text style={styles.metricLabel}>Pre-Approved</Text>
        </View>
      </View>

      {/* QR Scanner & Passcode Validation Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="qr-code-outline" size={20} color={colors.secondary} />
          <Text style={styles.cardTitle}>Verify GatePass (Scan / Code)</Text>
        </View>
        <Text style={styles.cardSub}>
          Scan visitor QR pass or verify 6-digit OTP code
        </Text>

        <View style={styles.passcodeRow}>
          <TextInput
            style={styles.passcodeInput}
            placeholder="e.g. GP-7821"
            placeholderTextColor="#94A3B8"
            value={passcode}
            onChangeText={setPasscode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerifyPasscode}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
            <Text style={styles.verifyBtnText}>Verify</Text>
          </TouchableOpacity>

          {/* Open Camera Scanner */}
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => setScannerVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual Check-In & Intercom Call Form */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Visitor Check-In & Ring Flat</Text>
        </View>

        {/* Visitor Photo Live Capture Box */}
        <View style={styles.photoCaptureRow}>
          <TouchableOpacity
            style={styles.photoCaptureBox}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            {capturedPhoto ? (
              <Image source={{ uri: capturedPhoto }} style={styles.photoCapturedImg} />
            ) : (
              <View style={styles.photoEmptyPlaceholder}>
                <Ionicons name="camera" size={24} color="#94A3B8" />
                <Text style={styles.photoEmptyText}>Take Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.photoBtnStack}>
            <TouchableOpacity style={styles.actionCamBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
              <Ionicons name="camera-reverse" size={16} color="#FFFFFF" />
              <Text style={styles.actionCamBtnText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionGalleryBtn} onPress={handlePickPhoto} activeOpacity={0.8}>
              <Ionicons name="image-outline" size={16} color="#94A3B8" />
              <Text style={styles.actionGalleryBtnText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.categoryRow}>
          {[
            { id: 'guest', label: 'Guest', icon: 'person' },
            { id: 'delivery', label: 'Delivery', icon: 'bicycle' },
            { id: 'cab', label: 'Cab', icon: 'car' },
            { id: 'service', label: 'Staff', icon: 'construct' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catPill,
                selectedCategory === cat.id && styles.catPillSelected,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={selectedCategory === cat.id ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.catText,
                  selectedCategory === cat.id && styles.catTextSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Flat Number Input */}
        <Text style={styles.inputLabel}>Visiting Flat Number *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. B-402"
          placeholderTextColor="#94A3B8"
          value={flatNo}
          onChangeText={setFlatNo}
        />

        {/* Visitor Name & Mobile */}
        <Text style={styles.inputLabel}>Visitor Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Sunil Verma / Zomato Rider"
          placeholderTextColor="#94A3B8"
          value={visitorName}
          onChangeText={setVisitorName}
        />

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Mobile No.</Text>
            <TextInput
              style={styles.textInput}
              placeholder="9876543210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Vehicle No.</Text>
            <TextInput
              style={styles.textInput}
              placeholder="KA-01-AB-1234"
              placeholderTextColor="#94A3B8"
              value={vehicleNo}
              onChangeText={setVehicleNo}
            />
          </View>
        </View>

        {/* Quick preset partner tags for delivery */}
        {selectedCategory === 'delivery' && (
          <View style={styles.presetTags}>
            {QUICK_DELIVERY_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagBtn}
                onPress={() => setVisitorName(`${tag} Partner`)}
              >
                <Text style={styles.tagBtnText}>+ {tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Primary Direct Check-In Action (Replacing Manual Paper Writing) */}
        <TouchableOpacity
          style={[styles.sendAlertBtn, { backgroundColor: '#10B981', marginBottom: 10 }]}
          onPress={handleDirectCheckIn}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={[styles.sendAlertBtnText, { fontWeight: '900' }]}>ALLOW ENTRY & SAVE TO REGISTER</Text>
        </TouchableOpacity>

        {/* Secondary Option: Resident Intercom Call */}
        <TouchableOpacity
          style={[styles.sendAlertBtn, { backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}
          onPress={handleSendRequest}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={16} color="#94A3B8" />
          <Text style={[styles.sendAlertBtnText, { color: '#CBD5E1', fontSize: 13 }]}>Call Flat {flatNo} Intercom</Text>
        </TouchableOpacity>
      </View>

      {/* Visitors Currently Inside Society (with Overstay Tracker) */}
      <View style={[styles.card, { marginBottom: 30 }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="log-in-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Visitors Inside Campus ({activeVisitors.length})</Text>
        </View>

        {activeVisitors.map((v, idx) => {
          const isOverstay = idx === 0; // Simulate overstay indicator
          return (
            <View key={v.id} style={styles.insideItem}>
              <View style={styles.insideAvatar}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <View style={styles.insideDetails}>
                <View style={styles.insideNameRow}>
                  <Text style={styles.insideName}>{v.name}</Text>
                  {isOverstay && (
                    <View style={styles.overstayBadge}>
                      <Text style={styles.overstayText}>Overstay 45m</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.insideMeta}>
                  Visiting {v.flat || 'B-402'} • In since {v.inTime || '11:15 AM'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => onCheckOutVisitor(v.id)}
              >
                <Text style={styles.checkoutBtnText}>Check Out</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Scanner Viewfinder Modal */}
      <ScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanSuccess={({ code, name }) => {
          setPasscode(code);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  guardBanner: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  guardBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardGateText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guardOfficerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  passcodeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  passcodeInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cameraBtn: {
    backgroundColor: colors.secondary,
    width: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCaptureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  photoCaptureBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCapturedImg: {
    width: '100%',
    height: '100%',
  },
  photoEmptyPlaceholder: {
    alignItems: 'center',
    gap: 2,
  },
  photoEmptyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  photoBtnStack: {
    flex: 1,
    gap: 8,
  },
  actionCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionCamBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  actionGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  actionGalleryBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  catPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  catPillSelected: {
    backgroundColor: colors.primary,
  },
  catText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  catTextSelected: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  presetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagBtn: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tagBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryDark,
  },
  sendAlertBtn: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  sendAlertBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  insideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  insideAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  insideDetails: {
    flex: 1,
  },
  insideNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insideName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  overstayBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  overstayText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  insideMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  checkoutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
});
