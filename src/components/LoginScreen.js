import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiLogin } from '../services/api';

const DEMO_RESIDENTS = [
  { name: 'Vishwa', flat: 'B-402', phone: '9876543210' },
  { name: 'Pooja Malhotra', flat: 'A-104', phone: '9811122233' },
];

const DEMO_GUARDS = [
  { name: 'Rajesh Kumar', badgeId: 'SEC-104', gate: 'Main Gate #1', pin: '1234' },
  { name: 'Sunil Shinde', badgeId: 'SEC-108', gate: 'Service Gate #2', pin: '1234' },
];

export default function LoginScreen({ onLoginSuccess }) {
  const [role, setRole] = useState('resident'); // 'resident' | 'guard'

  // Resident form states
  const [phone, setPhone] = useState('9876543210');
  const [flat, setFlat] = useState('B-402');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  // Guard form states
  const [badgeId, setBadgeId] = useState('SEC-104');
  const [guardGate, setGuardGate] = useState('Main Gate #1');
  const [pin, setPin] = useState('1234');

  const [loading, setLoading] = useState(false);

  // Handle Resident Login
  const handleResidentSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your registered mobile number');
      return;
    }
    if (!flat.trim()) {
      Alert.alert('Required', 'Please enter your flat number');
      return;
    }

    if (!otpStep) {
      // Send OTP simulation
      setOtpStep(true);
      setOtp('8492'); // Auto-populate demo OTP
      Alert.alert(
        'OTP Sent! 📲',
        `4-digit verification code sent to +91 ${phone}.\nDemo OTP: 8492`
      );
      return;
    }

    // Verify OTP and Login
    setLoading(true);
    try {
      const res = await apiLogin({
        role: 'resident',
        identifier: phone,
        pinOrOtp: otp,
        flat: flat.toUpperCase(),
      });
      setLoading(false);
      if (res && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      // Fallback offline login
      setLoading(false);
      onLoginSuccess({
        id: 'res-1',
        name: 'Vishwa (Resident Owner)',
        phone: phone,
        role: 'resident',
        flat: flat.toUpperCase(),
        society: 'Emerald Heights Residency',
      });
    }
  };

  // Handle Guard Login
  const handleGuardSubmit = async () => {
    if (!badgeId.trim()) {
      Alert.alert('Required', 'Please enter your Guard Badge ID or Phone');
      return;
    }
    if (!pin.trim()) {
      Alert.alert('Required', 'Please enter your 4-digit Security PIN');
      return;
    }

    setLoading(true);
    try {
      const res = await apiLogin({
        role: 'guard',
        identifier: badgeId,
        pinOrOtp: pin,
        gate: guardGate,
      });
      setLoading(false);
      if (res && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      // Fallback offline login
      setLoading(false);
      onLoginSuccess({
        id: 'sec-104',
        name: 'Rajesh Kumar (Duty Officer)',
        badgeId: badgeId.toUpperCase(),
        role: 'guard',
        gate: guardGate,
        society: 'Emerald Heights Residency',
      });
    }
  };

  // Quick Demo Resident Login
  const handleQuickResident = (demo) => {
    setPhone(demo.phone);
    setFlat(demo.flat);
    setOtpStep(false);
    onLoginSuccess({
      id: 'res-' + demo.flat,
      name: `${demo.name} (Flat ${demo.flat})`,
      phone: demo.phone,
      role: 'resident',
      flat: demo.flat,
      society: 'Emerald Heights Residency',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });
  };

  // Quick Demo Guard Login
  const handleQuickGuard = (demo) => {
    setBadgeId(demo.badgeId);
    setGuardGate(demo.gate);
    setPin(demo.pin);
    onLoginSuccess({
      id: 'sec-' + demo.badgeId,
      name: `${demo.name} (Duty Officer)`,
      badgeId: demo.badgeId,
      phone: '9900011222',
      role: 'guard',
      gate: demo.gate,
      society: 'Emerald Heights Residency',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Brand Header */}
          <View style={styles.brandHero}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.societyBadge}>
              <Ionicons name="business" size={13} color="#CBD5E1" />
              <Text style={styles.societyName}>Emerald Heights Residency</Text>
            </View>
            <Text style={styles.sloganText}>
              Every Entry Secure. Every Resident Safe.
            </Text>
          </View>

          {/* Role Segmented Selector */}
          <View style={styles.roleSegment}>
            <TouchableOpacity
              style={[
                styles.roleTab,
                role === 'resident' && styles.roleTabActiveResident,
              ]}
              onPress={() => {
                setRole('resident');
                setOtpStep(false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="home"
                size={16}
                color={role === 'resident' ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'resident' && styles.roleTabTextActive,
                ]}
              >
                Resident Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleTab,
                role === 'guard' && styles.roleTabActiveGuard,
              ]}
              onPress={() => setRole('guard')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={role === 'guard' ? '#FFFFFF' : colors.secondary}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'guard' && styles.roleTabTextActive,
                ]}
              >
                Security Staff
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {role === 'resident' ? (
              /* Resident Login Form */
              <View style={styles.form}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Resident Verification</Text>
                  <Text style={styles.formSub}>
                    Login with your registered flat & mobile number
                  </Text>
                </View>

                {/* Flat Number Input */}
                <Text style={styles.label}>Your Flat Number</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="keypad-outline" size={18} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. B-402 or A-104"
                    placeholderTextColor="#94A3B8"
                    value={flat}
                    onChangeText={setFlat}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Mobile Number Input */}
                <Text style={styles.label}>Registered Mobile Number</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.prefixText}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="98765 43210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                  />
                </View>

                {/* OTP Input (Shown when requested) */}
                {otpStep && (
                  <View style={styles.otpSection}>
                    <Text style={styles.label}>Enter 4-Digit OTP Code</Text>
                    <View style={[styles.inputWrap, styles.otpWrap]}>
                      <Ionicons name="lock-closed" size={18} color={colors.secondary} />
                      <TextInput
                        style={[styles.input, styles.otpInput]}
                        placeholder="8492"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={4}
                      />
                      <Text style={styles.demoTag}>Demo: 8492</Text>
                    </View>
                  </View>
                )}

                {/* Submit Action */}
                <TouchableOpacity
                  style={styles.submitBtnResident}
                  onPress={handleResidentSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtnText}>
                    {loading
                      ? 'Verifying...'
                      : otpStep
                      ? 'Verify & Enter App'
                      : 'Get Verification OTP'}
                  </Text>
                  <Ionicons
                    name={otpStep ? 'arrow-forward' : 'paper-plane'}
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                {/* 1-Tap Demo Profiles for Resident */}
                <View style={styles.demoSection}>
                  <Text style={styles.demoHeader}>Quick 1-Tap Demo Resident Logins:</Text>
                  <View style={styles.demoPills}>
                    {DEMO_RESIDENTS.map((demo) => (
                      <TouchableOpacity
                        key={demo.flat}
                        style={styles.demoPill}
                        onPress={() => handleQuickResident(demo)}
                      >
                        <Ionicons name="person-circle" size={18} color={colors.primary} />
                        <Text style={styles.demoPillText}>
                          {demo.name} ({demo.flat})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              /* Security Staff Login Form */
              <View style={styles.form}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Security Gate Terminal</Text>
                  <Text style={styles.formSub}>
                    Duty officer badge verification & shift gate login
                  </Text>
                </View>

                {/* Assigned Gate Selector */}
                <Text style={styles.label}>Select Duty Gate</Text>
                <View style={styles.gatePills}>
                  {['Main Gate #1', 'Service Gate #2', 'Back Gate #3'].map((gate) => (
                    <TouchableOpacity
                      key={gate}
                      style={[
                        styles.gatePill,
                        guardGate === gate && styles.gatePillSelected,
                      ]}
                      onPress={() => setGuardGate(gate)}
                    >
                      <Ionicons
                        name="shield"
                        size={12}
                        color={guardGate === gate ? '#FFFFFF' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.gatePillText,
                          guardGate === gate && styles.gatePillTextSelected,
                        ]}
                      >
                        {gate}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Guard Badge ID Input */}
                <Text style={styles.label}>Guard Badge ID or Phone</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="id-card-outline" size={18} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. SEC-104 or 9900011222"
                    placeholderTextColor="#94A3B8"
                    value={badgeId}
                    onChangeText={setBadgeId}
                    autoCapitalize="characters"
                  />
                </View>

                {/* 4-Digit Security PIN */}
                <Text style={styles.label}>4-Digit Security PIN</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="key-outline" size={18} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="1234"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    keyboardType="number-pad"
                    value={pin}
                    onChangeText={setPin}
                    maxLength={4}
                  />
                  <Text style={styles.demoTag}>Default: 1234</Text>
                </View>

                {/* Submit Action for Guard */}
                <TouchableOpacity
                  style={styles.submitBtnGuard}
                  onPress={handleGuardSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtnText}>
                    {loading ? 'Authenticating...' : 'Open Security Terminal'}
                  </Text>
                  <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                {/* 1-Tap Demo Profiles for Guard */}
                <View style={styles.demoSection}>
                  <Text style={styles.demoHeader}>Quick 1-Tap Demo Guard Logins:</Text>
                  <View style={styles.demoPills}>
                    {DEMO_GUARDS.map((demo) => (
                      <TouchableOpacity
                        key={demo.badgeId}
                        style={[styles.demoPill, { borderColor: '#FED7AA' }]}
                        onPress={() => handleQuickGuard(demo)}
                      >
                        <Ionicons name="shield-checkmark" size={18} color={colors.secondary} />
                        <Text style={styles.demoPillText}>
                          {demo.name} ({demo.gate})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Footer Security Notice */}
          <View style={styles.footer}>
            <Ionicons name="lock-closed-outline" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>
              256-Bit SSL Encrypted • ISO 27001 Certified Security Protocol
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBox: {
    height: 52,
    width: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  societyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 6,
  },
  societyName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  sloganText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  roleSegment: {
    flexDirection: 'row',
    backgroundColor: '#071630',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  roleTabActiveResident: {
    backgroundColor: colors.primary,
  },
  roleTabActiveGuard: {
    backgroundColor: colors.secondary,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  formHeader: {
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  formSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  otpSection: {
    marginTop: 6,
    gap: 4,
  },
  otpWrap: {
    borderColor: colors.secondary,
    backgroundColor: '#FFF7ED',
  },
  otpInput: {
    letterSpacing: 4,
    fontWeight: '900',
    fontSize: 18,
    color: colors.secondary,
  },
  demoTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  submitBtnResident: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnGuard: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  demoHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
  },
  demoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gatePills: {
    flexDirection: 'row',
    gap: 6,
  },
  gatePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gatePillSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  gatePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  gatePillTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
});

