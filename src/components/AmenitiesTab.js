import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { amenitiesList } from '../data/mockData';

export default function AmenitiesTab() {
  const [amenities, setAmenities] = useState(amenitiesList);

  const handleBook = (item) => {
    Alert.alert(
      'Book Facility',
      `Would you like to book a slot for ${item.name} (${item.price})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Slot',
          onPress: () =>
            Alert.alert(
              'Booking Confirmed!',
              `Your reservation for ${item.name} has been approved. A notification was sent to society management.`
            ),
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={item.icon} size={28} color={colors.secondary} />
      </View>
      <View style={styles.infoCol}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detail}>Capacity: {item.capacity} • {item.timing}</Text>
        <View style={styles.tagRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{item.status}</Text>
          </View>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => handleBook(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.bookBtnText}>Book</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Society Amenities & Facilities</Text>
        <Text style={styles.subTitle}>Reserve sports courts, banquet hall & pool</Text>
      </View>
      <FlatList
        data={amenities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

