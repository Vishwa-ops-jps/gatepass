import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ScannerModal({ visible, onClose, onScanSuccess }) {
  const [torchOn, setTorchOn] = useState(false);

  if (!visible) return null;

  const handleSimulateScan = (code, name, type) => {
    onScanSuccess({ code, name, type });
    Alert.alert('QR Passcode Verified! ✅', `Valid GatePass for ${name} (${code}). Barrier opening.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.scannerContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.titleRow}>
              <Ionicons name="scan" size={22} color={colors.secondary} />
              <Text style={styles.title}>GatePass QR Scanner</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Viewfinder Target */}
          <View style={styles.viewfinder}>
            {/* Corner Brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Laser Line */}
            <View style={styles.laserLine} />

            <View style={styles.guideBox}>
              <Ionicons name="qr-code-outline" size={80} color="rgba(255, 255, 255, 0.25)" />
              <Text style={styles.guideText}>Align Visitor QR Code or Barcode</Text>
            </View>
          </View>

          {/* Torch and Presets */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.torchBtn, torchOn && styles.torchBtnActive]}
              onPress={() => setTorchOn(!torchOn)}
            >
              <Ionicons
                name={torchOn ? 'flash' : 'flash-outline'}
                size={20}
                color={torchOn ? '#F59E0B' : '#FFFFFF'}
              />
              <Text style={styles.torchText}>{torchOn ? 'Torch ON' : 'Flashlight'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.demoTitle}>Simulate Rapid Gate Scans:</Text>
          <View style={styles.quickScanRow}>
            <TouchableOpacity
              style={styles.quickScanBtn}
              onPress={() => handleSimulateScan('GP-7821', 'Priyanshu Sharma (Guest)', 'guest')}
            >
              <Ionicons name="person" size={14} color="#FFFFFF" />
              <Text style={styles.quickScanText}>Guest (GP-7821)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickScanBtn, { backgroundColor: '#EA580C' }]}
              onPress={() => handleSimulateScan('GP-4190', 'Swiggy Food Rider', 'delivery')}
            >
              <Ionicons name="bicycle" size={14} color="#FFFFFF" />
              <Text style={styles.quickScanText}>Swiggy Pass</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scannerContainer: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  viewfinder: {
    width: 260,
    height: 260,
    borderRadius: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.secondary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  laserLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  guideBox: {
    alignItems: 'center',
    gap: 12,
  },
  guideText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  controlsRow: {
    marginBottom: 20,
  },
  torchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  torchBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  torchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  demoTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  quickScanRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  quickScanBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickScanText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
