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
          {/* Live Sync Dot */}
          <View
            style={[
              styles.syncDot,
              { backgroundColor: backendConnected ? '#10B981' : '#94A3B8' },
            ]}
          />

          {/* Role Switcher Pill */}
          <TouchableOpacity
            style={[
              styles.roleBadge,
              role === 'guard' ? styles.roleBadgeGuard : styles.roleBadgeResident,
            ]}
            onPress={onToggleRole}
            activeOpacity={0.8}
          >
            <Ionicons
              name={role === 'guard' ? 'shield-checkmark' : 'home'}
              size={13}
              color={role === 'guard' ? '#FFFFFF' : colors.primary}
            />
            <Text
              style={[
                styles.roleBadgeText,
                role === 'guard' ? styles.roleBadgeTextGuard : styles.roleBadgeTextResident,
              ]}
            >
              {role === 'guard' ? 'Guard' : 'Resident'}
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
          <Ionicons name="person-circle-outline" size={16} color="#CBD5E1" />
          <Text style={styles.societyName}>
            {currentUser?.name || (role === 'guard' ? 'Rajesh Kumar (Guard)' : 'Vishwa')}
          </Text>
        </View>
        <View style={styles.flatTag}>
          <Text style={styles.flatText}>
            {role === 'guard'
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
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoWrapper: {
    height: 38,
    width: 150,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    paddingTop: 6,
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

