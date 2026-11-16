import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Header({
  role,
  onToggleRole,
  pendingCount,
  onOpenNotifications,
  backendConnected,
  currentUser,
  onLogout,
  onOpenDevTools,
}) {
  return (
    <View style={styles.container}>
      {/* Top Bar with Logo & Actions */}
      <View style={styles.topRow}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.actionsRow}>
          {/* Dev Tools Quick Pill */}
          <TouchableOpacity
            style={styles.devPill}
            onPress={onOpenDevTools}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.syncDot,
                { backgroundColor: backendConnected ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text style={styles.devPillText}>DEV</Text>
          </TouchableOpacity>

          {/* Role Switcher Pill */}
          <TouchableOpacity
            style={[
              styles.roleBadge,
              role === 'admin'
                ? styles.roleBadgeAdmin
                : role === 'guard'
                ? styles.roleBadgeGuard
                : styles.roleBadgeResident,
            ]}
            onPress={onToggleRole}
            activeOpacity={0.8}
          >
            <Ionicons
              name={role === 'admin' ? 'business' : role === 'guard' ? 'shield-checkmark' : 'home'}
              size={13}
              color={role === 'resident' ? colors.primary : '#FFFFFF'}
            />
            <Text
              style={[
                styles.roleBadgeText,
                role === 'admin'
                  ? styles.roleBadgeTextAdmin
                  : role === 'guard'
                  ? styles.roleBadgeTextGuard
                  : styles.roleBadgeTextResident,
              ]}
            >
              {role === 'admin' ? 'Admin' : role === 'guard' ? 'Guard' : 'Resident'}
            </Text>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Logout / Switch Profile Button */}
          {onLogout && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={onLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Community Location & User Info Strip */}
      <View style={styles.subBar}>
        <View style={styles.locationInfo}>
          <Ionicons
            name={role === 'admin' ? 'business-outline' : 'person-circle-outline'}
            size={16}
            color="#CBD5E1"
          />
          <Text style={styles.societyName}>
            {currentUser?.name ||
              (role === 'admin'
                ? 'Col. R. S. Rathore (Admin)'
                : role === 'guard'
                ? 'Rajesh Kumar (Guard)'
                : 'Vishwa')}
          </Text>
        </View>
        <View
          style={[
            styles.flatTag,
            role === 'admin' && { backgroundColor: 'rgba(56, 189, 248, 0.2)', borderColor: '#38BDF8', borderWidth: 1 },
          ]}
        >
          <Text
            style={[
              styles.flatText,
              role === 'admin' && { color: '#38BDF8', fontWeight: '800' },
            ]}
          >
            {role === 'admin'
              ? 'Society Management Committee'
              : role === 'guard'
              ? currentUser?.gate || 'Gate #1 Main Gate'
              : `Flat ${currentUser?.flat || 'B-402'}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryDark,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoWrapper: {
    height: 40,
    width: 158,
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  devPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  devPillText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  roleBadgeResident: {
    backgroundColor: '#FFFFFF',
  },
  roleBadgeGuard: {
    backgroundColor: colors.secondary,
  },
  roleBadgeAdmin: {
    backgroundColor: '#10B981',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roleBadgeTextResident: {
    color: colors.primary,
  },
  roleBadgeTextGuard: {
    color: '#FFFFFF',
  },
  roleBadgeTextAdmin: {
    color: '#FFFFFF',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.secondary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  subBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  societyName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  flatTag: {
    backgroundColor: 'rgba(255, 107, 0, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  flatText: {
    color: colors.secondaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
});
