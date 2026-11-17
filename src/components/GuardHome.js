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

const PRESET_PHOTOS = {
  guest: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  delivery: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  cab: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  tech: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
};

const FLAT_PRESETS = ['B-402', 'A-104', 'C-201', 'A-101', 'B-101'];

const PURPOSES_ROW_1 = [
  { id: 'delivery', label: 'Delivery', icon: 'bicycle', desc: 'Food / Parcel Delivery' },
  { id: 'guest', label: 'Guest', icon: 'people', desc: 'Friend / Family Visit' },
  { id: 'cab', label: 'Cab / Taxi', icon: 'car', desc: 'Uber / Ola Pickup' },
];

const PURPOSES_ROW_2 = [
  { id: 'service', label: 'Service / Tech', icon: 'construct', desc: 'AC / Plumbing / Repair' },
  { id: 'courier', label: 'Courier / Post', icon: 'cube', desc: 'Amazon / Courier Partner' },
  { id: 'other', label: 'Other Visit', icon: 'door-open', desc: 'Official / Other Entry' },
];

const ALL_PURPOSES = [...PURPOSES_ROW_1, ...PURPOSES_ROW_2];

export default function GuardHome({
  onDirectVisitorEntry,
  activeVisitors = [],
  historicalVisitors = [],
  onCheckOutVisitor,
  onExportExcel,
}) {
  const [flatNo, setFlatNo] = useState('B-402');
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('delivery');
  const [vehicleNo, setVehicleNo] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(PRESET_PHOTOS.delivery);
  const [searchQuery, setSearchQuery] = useState('');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');

  // Live Camera capture
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

  // Gallery photo upload
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

  const handleSelectPreset = (key) => {
    setCapturedPhoto(PRESET_PHOTOS[key] || PRESET_PHOTOS.guest);
    if (key === 'delivery') setSelectedPurpose('delivery');
    else if (key === 'cab') setSelectedPurpose('cab');
    else if (key === 'tech') setSelectedPurpose('service');
    else setSelectedPurpose('guest');
  };

  const handleAllowEntry = () => {
    if (!flatNo.trim()) {
      Alert.alert('Required', 'Please enter destination flat number (e.g. B-402)');
      return;
    }

    const purposeObj = ALL_PURPOSES.find((p) => p.id === selectedPurpose) || ALL_PURPOSES[0];
    const name = visitorName.trim() || (selectedPurpose === 'delivery' ? 'Delivery Partner' : 'Visitor');
    const photo = capturedPhoto || PRESET_PHOTOS.guest;

    const payload = {
      name,
      flat: flatNo.trim().toUpperCase(),
      phone: phone.trim() || '+91 98000 11222',
      purpose: purposeObj.desc,
      category: selectedPurpose,
      vehicle: vehicleNo.trim() ? vehicleNo.trim().toUpperCase() : null,
      photo,
    };

    if (onDirectVisitorEntry) {
      onDirectVisitorEntry(payload);
    }

    setVisitorName('');
    setPhone('');
    setVehicleNo('');
  };

  const filteredActiveVisitors = activeVisitors.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.flat && v.flat.toLowerCase().includes(q)) ||
      (v.purpose && v.purpose.toLowerCase().includes(q))
    );
  });

  const displayHistory = historicalVisitors && historicalVisitors.length > 0 ? historicalVisitors : [
    { id: 'h-1', name: 'Suresh Raina', flat: 'B-402', phone: '9844455666', purpose: 'Guest / Relative', inTime: '02:50 PM', out_time_display: '03:45 PM', status: 'Departed' },
    { id: 'h-2', name: 'Mukesh Kumar (Zomato)', flat: 'B-402', phone: '9123456789', purpose: 'Food Delivery', inTime: '01:15 PM', out_time_display: '01:25 PM', status: 'Departed' },
    { id: 'h-3', name: 'Amazon Courier', flat: 'A-104', phone: '9811200011', purpose: 'Parcel Delivery', inTime: '12:00 PM', out_time_display: '12:10 PM', status: 'Departed' },
  ];

  const filteredHistory = displayHistory.filter((v) => {
    if (!archiveSearchQuery) return true;
    const q = archiveSearchQuery.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.flat && v.flat.toLowerCase().includes(q)) ||
      (v.purpose && v.purpose.toLowerCase().includes(q))
    );
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ==================== 1. LOG VISITOR ENTRY PANEL ==================== */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <View style={styles.panelTitleRow}>
              <Ionicons name="camera" size={17} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.panelTitle}>Log Visitor Entry</Text>
            </View>
            <Text style={styles.panelSubtitle}>Take visitor photo, enter flat & purpose</Text>
          </View>
          <View style={styles.autoPersistBadge}>
            <Ionicons name="save-outline" size={11} color="#34D399" style={{ marginRight: 3 }} />
            <Text style={styles.autoPersistText}>Auto-Persist</Text>
          </View>
        </View>

        {/* Visitor Photo Capture Section */}
        <Text style={styles.label}>
          Visitor Photo <Text style={styles.req}>*</Text>
        </Text>
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoPreviewBox} onPress={handleTakePhoto} activeOpacity={0.8}>
            {capturedPhoto ? (
              <Image source={{ uri: capturedPhoto }} style={styles.photoImg} />
            ) : (
              <View style={styles.photoEmpty}>
                <Ionicons name="camera" size={24} color="#64748B" />
                <Text style={styles.photoEmptyText}>Open Cam</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.photoControls}>
            <View style={styles.photoBtnRow}>
              <TouchableOpacity style={styles.btnSnap} onPress={handleTakePhoto} activeOpacity={0.85}>
                <Ionicons name="camera" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnSnapText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnUpload} onPress={handlePickPhoto} activeOpacity={0.85}>
                <Ionicons name="cloud-upload-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnUploadText}>Upload</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presetsRow}>
              <Text style={styles.presetLabel}>Presets:</Text>
              {['guest', 'delivery', 'cab', 'tech'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetChip, capturedPhoto === PRESET_PHOTOS[p] && styles.presetChipActive]}
                  onPress={() => handleSelectPreset(p)}
                >
                  <Text style={[styles.presetChipText, capturedPhoto === PRESET_PHOTOS[p] && styles.presetChipTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Visitor Full Name */}
        <Text style={styles.label}>
          Visitor Full Name <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. Rahul Sharma or Swiggy Partner"
          placeholderTextColor="#64748B"
          value={visitorName}
          onChangeText={setVisitorName}
        />

        {/* Mobile Phone Number */}
        <Text style={styles.label}>Mobile Phone Number</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. 9876543210"
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Visiting Flat / House # */}
        <Text style={styles.label}>
          Visiting Flat / House # <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.inputBox}
          placeholder="E.G. B-402, A-104, C-201"
          placeholderTextColor="#64748B"
          value={flatNo}
          onChangeText={setFlatNo}
          autoCapitalize="characters"
        />

        {/* Quick Flat Chips */}
        <View style={styles.flatChipsRow}>
          {FLAT_PRESETS.map((flat) => (
            <TouchableOpacity
              key={flat}
              style={[styles.flatChip, flatNo === flat && styles.flatChipActive]}
              onPress={() => setFlatNo(flat)}
            >
              <Text style={[styles.flatChipText, flatNo === flat && styles.flatChipTextActive]}>
                Flat {flat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Purpose of Visit Grid (2 rows x 3 columns = 100% Mobile Safe) */}
        <Text style={styles.label}>
          Purpose of Visit <Text style={styles.req}>*</Text>
        </Text>
        
        {/* Row 1 */}
        <View style={styles.purposeRow}>
          {PURPOSES_ROW_1.map((pur) => (
            <TouchableOpacity
              key={pur.id}
              style={[styles.purposeBtn, selectedPurpose === pur.id && styles.purposeBtnActive]}
              onPress={() => setSelectedPurpose(pur.id)}
            >
              <Ionicons
                name={pur.icon}
                size={16}
                color={selectedPurpose === pur.id ? '#34D399' : '#94A3B8'}
              />
              <Text
                style={[styles.purposeBtnText, selectedPurpose === pur.id && styles.purposeBtnTextActive]}
                numberOfLines={1}
              >
                {pur.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 2 */}
        <View style={styles.purposeRow}>
          {PURPOSES_ROW_2.map((pur) => (
            <TouchableOpacity
              key={pur.id}
              style={[styles.purposeBtn, selectedPurpose === pur.id && styles.purposeBtnActive]}
              onPress={() => setSelectedPurpose(pur.id)}
            >
              <Ionicons
                name={pur.icon}
                size={16}
                color={selectedPurpose === pur.id ? '#34D399' : '#94A3B8'}
              />
              <Text
                style={[styles.purposeBtnText, selectedPurpose === pur.id && styles.purposeBtnTextActive]}
                numberOfLines={1}
              >
                {pur.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vehicle Number (Optional) */}
        <Text style={styles.label}>Vehicle Number (Optional)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. KA-04-AB-1234"
          placeholderTextColor="#64748B"
          value={vehicleNo}
          onChangeText={setVehicleNo}
          autoCapitalize="characters"
        />

        {/* Primary Submit Button (Guaranteed Zero Overflow) */}
        <TouchableOpacity style={styles.btnSubmit} onPress={handleAllowEntry} activeOpacity={0.88}>
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnSubmitText}>ALLOW ENTRY & SAVE</Text>
        </TouchableOpacity>
      </View>

      {/* ==================== 2. CURRENTLY INSIDE CAMPUS ==================== */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <View style={styles.panelTitleRow}>
              <Ionicons name="business" size={17} color="#34D399" style={{ marginRight: 6 }} />
              <Text style={styles.panelTitle}>Currently Inside Campus</Text>
            </View>
            <Text style={styles.panelSubtitle}>Tap "Check Out" when visitor departs</Text>
          </View>
          <View style={styles.activeCounterBadge}>
            <Text style={styles.activeCounterText}>{activeVisitors.length} Active</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={14} color="#64748B" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search active visitors..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Visitor Cards */}
        {filteredActiveVisitors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="shield-outline" size={26} color="#475569" />
            <Text style={styles.emptyTitle}>No Visitors Currently Inside Campus</Text>
            <Text style={styles.emptySubtitle}>Log visitor entry above when they reach the gate.</Text>
          </View>
        ) : (
          filteredActiveVisitors.map((v) => {
            const photoUri = v.image || PRESET_PHOTOS[v.category] || PRESET_PHOTOS.guest;
            const inTimeStr = v.inTime || 'Just now';

            return (
              <View key={v.id} style={styles.visitorCard}>
                <View style={styles.visitorLeft}>
                  <Image source={{ uri: photoUri }} style={styles.visitorThumb} />
                  <View style={styles.visitorInfo}>
                    <View style={styles.visitorNameRow}>
                      <Text style={styles.visitorName} numberOfLines={1}>
                        {v.name}
                      </Text>
                      <View style={styles.flatTag}>
                        <Text style={styles.flatTagText}>Flat {v.flat}</Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <View style={styles.purposeTag}>
                        <Text style={styles.purposeTagText} numberOfLines={1}>{v.purpose || 'Visit'}</Text>
                      </View>
                      <View style={styles.timeTag}>
                        <Ionicons name="time-outline" size={11} color="#34D399" style={{ marginRight: 2 }} />
                        <Text style={styles.timeTagText}>In: {inTimeStr}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Check Out Button */}
                <TouchableOpacity
                  style={styles.btnCheckOut}
                  onPress={() => onCheckOutVisitor(v.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={14} color="#F87171" style={{ marginRight: 4 }} />
                  <Text style={styles.btnCheckOutText}>Check Out</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {/* ==================== 3. PERMANENT LOGBOOK & ARCHIVE (EXCEL SHEET) ==================== */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <View style={styles.panelTitleRow}>
              <Ionicons name="document-text" size={17} color="#FB923C" style={{ marginRight: 6 }} />
              <Text style={styles.panelTitle}>Permanent Visitor Logbook</Text>
            </View>
            <Text style={styles.panelSubtitle}>Historical register stored permanently with photos</Text>
          </View>
        </View>

        {/* PROMINENT EXCEL SHEET DOWNLOAD BUTTON */}
        <TouchableOpacity style={styles.btnBigExcelExport} onPress={onExportExcel} activeOpacity={0.85}>
          <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnBigExcelExportText}>DOWNLOAD EXCEL SHEET (CSV)</Text>
        </TouchableOpacity>

        {/* Filter search in archive */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={14} color="#64748B" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search full logbook by name, flat, date..."
            placeholderTextColor="#64748B"
            value={archiveSearchQuery}
            onChangeText={setArchiveSearchQuery}
          />
        </View>

        {/* History items */}
        {filteredHistory.map((item) => {
          const isOut = item.status === 'Departed';
          const photoUri = item.image || item.photo || PRESET_PHOTOS.guest;
          const outTimeStr = item.out_time_display || item.outTime || '—';

          return (
            <View key={item.id} style={styles.historyCard}>
              <Image source={{ uri: photoUri }} style={styles.historyThumb} />
              <View style={styles.historyInfo}>
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.flatTag}>
                    <Text style={styles.flatTagText}>Flat {item.flat}</Text>
                  </View>
                </View>
                <Text style={styles.historyPurpose} numberOfLines={1}>{item.purpose || 'Visitor Entry'}</Text>
                <View style={styles.historyTimeRow}>
                  <Text style={styles.historyTimeText}>In: {item.inTime || 'Recorded'}</Text>
                  {isOut ? <Text style={styles.historyTimeText}> • Out: {outTimeStr}</Text> : null}
                </View>
              </View>
              <View style={[styles.historyStatusBadge, isOut ? styles.badgeDeparted : styles.badgeInside]}>
                <Text style={[styles.historyStatusText, isOut ? styles.textDeparted : styles.textInside]}>
                  {isOut ? 'Departed' : 'Inside'}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Version Badge Stamp */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>GatePass Security v1.0.1 (Build 5) • Excel Enabled</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  panel: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    marginBottom: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  panelSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  autoPersistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoPersistText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
  },
  btnBigExcelExport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  btnBigExcelExportText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#CBD5E1',
    marginBottom: 5,
    marginTop: 8,
  },
  req: {
    color: '#EF4444',
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
  },
  photoPreviewBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#374151',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: 10,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    alignItems: 'center',
  },
  photoEmptyText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  photoControls: {
    flex: 1,
  },
  photoBtnRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  btnSnap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 7,
    borderRadius: 7,
    marginRight: 6,
  },
  btnSnapText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  btnUpload: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 7,
    borderRadius: 7,
  },
  btnUploadText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  presetLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    marginRight: 4,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 4,
    marginBottom: 2,
  },
  presetChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  presetChipText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  inputBox: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  flatChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  flatChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 5,
    marginBottom: 5,
  },
  flatChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  flatChipText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  flatChipTextActive: {
    color: '#FFFFFF',
  },
  purposeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  purposeBtn: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  purposeBtnText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  purposeBtnTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  btnSubmit: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 12,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeCounterBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeCounterText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyTitle: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  visitorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  visitorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitorThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    flexShrink: 0,
    marginRight: 9,
  },
  visitorInfo: {
    flex: 1,
    minWidth: 0,
  },
  visitorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  visitorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    flexShrink: 1,
    marginRight: 6,
  },
  flatTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    flexShrink: 0,
  },
  flatTagText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  purposeTag: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    maxWidth: '65%',
    marginRight: 6,
  },
  purposeTagText: {
    color: '#FB923C',
    fontSize: 9,
    fontWeight: '700',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTagText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '700',
  },
  btnCheckOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 7,
    paddingVertical: 6,
  },
  btnCheckOutText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  historyThumb: {
    width: 36,
    height: 36,
    borderRadius: 7,
    backgroundColor: '#1E293B',
    flexShrink: 0,
    marginRight: 8,
  },
  historyInfo: {
    flex: 1,
    minWidth: 0,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  historyName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    flexShrink: 1,
    marginRight: 6,
  },
  historyPurpose: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  historyTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTimeText: {
    fontSize: 9,
    color: '#64748B',
  },
  historyStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    flexShrink: 0,
    marginLeft: 6,
  },
  badgeInside: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeDeparted: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  historyStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textInside: {
    color: '#34D399',
  },
  textDeparted: {
    color: '#94A3B8',
  },
  versionRow: {
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
  },
  versionText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
  },
});
