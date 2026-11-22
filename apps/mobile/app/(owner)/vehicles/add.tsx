import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addOwnerVehicle } from '../../../src/api/owner';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius } from '../../../src/theme/spacing';
import { Header } from '../../../src/components/ui/Header';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { OPERATIONAL_CITIES } from '@vahanloop/shared';

export default function AddVehicleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<'CAR' | 'BIKE' | 'SCOOTER'>('CAR');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL' | 'ELECTRIC' | 'CNG'>('PETROL');
  const [transmission, setTransmission] = useState<'MANUAL' | 'AUTOMATIC'>('MANUAL');
  const [location, setLocation] = useState('Jabalpur');
  const [dailyPrice, setDailyPrice] = useState('2500');
  const [driverCharge, setDriverCharge] = useState('600');
  const [selfDriveEnabled, setSelfDriveEnabled] = useState(true);
  const [chauffeurEnabled, setChauffeurEnabled] = useState(false);

  const addMutation = useMutation({
    mutationFn: () =>
      addOwnerVehicle({
        category,
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year) || 2024,
        registrationNumber: regNumber.trim().toUpperCase(),
        fuelType,
        transmission,
        seatingCapacity: category === 'CAR' ? 5 : 2,
        location,
        dailyRentalPrice: parseFloat(dailyPrice) || 2500,
        driverCharge: parseFloat(driverCharge) || 0,
        selfDriveEnabled,
        chauffeurEnabled,
        images: [
          category === 'CAR'
            ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner_vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['owner_dashboard'] });
      Alert.alert(
        'Vehicle Registered',
        'Your vehicle has been submitted for platform compliance review.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Registration Failed', err?.message || 'Could not register vehicle.');
    },
  });

  const handleSubmit = () => {
    if (!make.trim() || !model.trim() || !regNumber.trim() || !dailyPrice) {
      Alert.alert('Validation Error', 'Please complete all mandatory vehicle specifications.');
      return;
    }
    addMutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Register New Vehicle" subtitle="Host Onboarding Form" showBack />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Category Choice */}
        <Text style={styles.sectionHeading}>VEHICLE TYPE</Text>
        <View style={styles.catRow}>
          {(['CAR', 'BIKE', 'SCOOTER'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, category === cat ? styles.catBtnSelected : null]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat ? styles.catTextSelected : null]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Basic Specs */}
        <View style={styles.formCard}>
          <Input
            label="Manufacturer / Make"
            placeholder="e.g. Mahindra, Tata, Royal Enfield"
            value={make}
            onChangeText={setMake}
          />

          <Input
            label="Model Name"
            placeholder="e.g. Thar LX 4x4, Nexon.ev, Himalayan"
            value={model}
            onChangeText={setModel}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Input
                label="Manufacturing Year"
                placeholder="2024"
                keyboardType="numeric"
                value={year}
                onChangeText={setYear}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Registration Plate"
                placeholder="e.g. MP-20-CB-4089"
                autoCapitalize="characters"
                value={regNumber}
                onChangeText={setRegNumber}
              />
            </View>
          </View>

          {/* Location Depot Choice */}
          <Text style={styles.fieldLabel}>Depot Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locScroll}>
            {OPERATIONAL_CITIES.filter((c) => c !== 'All Cities').map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.locChip, location === city ? styles.locChipActive : null]}
                onPress={() => setLocation(city)}
              >
                <Text style={[styles.locChipText, location === city ? styles.locChipTextActive : null]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Fuel & Transmission */}
          <Text style={styles.fieldLabel}>Fuel Type</Text>
          <View style={styles.catRow}>
            {(['PETROL', 'DIESEL', 'ELECTRIC', 'CNG'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.fuelBtn, fuelType === f ? styles.fuelBtnSelected : null]}
                onPress={() => setFuelType(f)}
              >
                <Text style={[styles.fuelText, fuelType === f ? styles.fuelTextSelected : null]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Input
                label="Daily Rental Rate (₹)"
                placeholder="2500"
                keyboardType="numeric"
                value={dailyPrice}
                onChangeText={setDailyPrice}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Chauffeur Charge / Day (₹)"
                placeholder="600"
                keyboardType="numeric"
                value={driverCharge}
                onChangeText={setDriverCharge}
              />
            </View>
          </View>

          {/* Rental Mode Toggles */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Allow Self-Drive</Text>
              <Text style={styles.switchSub}>Customers drive with verified DL</Text>
            </View>
            <Switch
              value={selfDriveEnabled}
              onValueChange={setSelfDriveEnabled}
              trackColor={{ false: Colors.gray300, true: Colors.emerald }}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.switchTitle}>Allow Chauffeur-Driven</Text>
              <Text style={styles.switchSub}>Trip dispatched with commercial driver</Text>
            </View>
            <Switch
              value={chauffeurEnabled}
              onValueChange={setChauffeurEnabled}
              trackColor={{ false: Colors.gray300, true: Colors.emerald }}
            />
          </View>

          <Button
            title="Submit Listing for Approval"
            variant="emerald"
            size="lg"
            loading={addMutation.isPending}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  catRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  catBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  catBtnSelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  catTextSelected: {
    color: Colors.white,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  locScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.base,
  },
  locChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  locChipActive: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  locChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  locChipTextActive: {
    color: Colors.white,
  },
  fuelBtn: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  fuelBtnSelected: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  fuelText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  fuelTextSelected: {
    color: Colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  switchSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    marginTop: Spacing.lg,
  },
});
