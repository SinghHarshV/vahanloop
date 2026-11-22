import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../src/theme/spacing';
import { Header } from '../../../src/components/ui/Header';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Modal } from '../../../src/components/ui/Modal';
import { Input } from '../../../src/components/ui/Input';
import {
  MapPin,
  Navigation,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Car,
} from 'lucide-react-native';

const STEPS = [
  { id: 'EN_ROUTE', label: '1. En Route to Pickup' },
  { id: 'ARRIVED', label: '2. Arrived at Pickup Hub' },
  { id: 'IN_PROGRESS', label: '3. Trip in Progress' },
  { id: 'COMPLETED', label: '4. Trip Completed' },
];

export default function DriverTripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [incidentNote, setIncidentNote] = useState('');

  const advanceStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      Alert.alert('Trip Finished', 'Trip has been marked COMPLETED. Returning to roster.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleReportIncident = () => {
    Alert.alert('Incident Logged', 'Emergency dispatch team and passenger have been notified.', [
      {
        text: 'OK',
        onPress: () => {
          setIncidentModalVisible(false);
          setIncidentNote('');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Trip Execution" subtitle="Live dispatch & waypoint tracking" showBack />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Progress Tracker Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>TRIP PROGRESSION</Text>
          <View style={styles.stepsContainer}>
            {STEPS.map((s, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <View key={s.id} style={styles.stepRow}>
                  <View style={[styles.stepBullet, isDone ? styles.stepBulletDone : null]}>
                    {isDone ? (
                      <CheckCircle2 size={16} color={Colors.white} />
                    ) : (
                      <Text style={styles.stepNum}>{idx + 1}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, isCurrent ? styles.stepLabelCurrent : null]}>
                    {s.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <Button
            title={
              currentStepIndex === 0
                ? 'Mark: Arrived at Pickup Hub'
                : currentStepIndex === 1
                ? 'Mark: Passenger Onboard & Trip Started'
                : currentStepIndex === 2
                ? 'Mark: Arrived at Drop & Complete'
                : 'Trip Finished'
            }
            variant="emerald"
            size="lg"
            onPress={advanceStep}
            style={{ marginTop: Spacing.base }}
          />
        </View>

        {/* Passenger & Vehicle Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>ASSIGNMENT PARTICULARS</Text>
          <View style={styles.infoRow}>
            <Car size={18} color={Colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Mahindra Thar LX 4x4 Hard Top</Text>
              <Text style={styles.infoSub}>Registration: MP-20-CB-4089</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Phone size={18} color={Colors.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Passenger: Rahul Sharma</Text>
              <Text style={styles.infoSub}>Contact: +91 98765 43210</Text>
            </View>
          </View>
        </View>

        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>ROUTE WAYPOINTS</Text>
          <View style={styles.routeItem}>
            <MapPin size={16} color={Colors.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={styles.waypointLabel}>Pickup Depot</Text>
              <Text style={styles.waypointVal}>Hotel Gulzar Towers, Civil Lines, Jabalpur</Text>
            </View>
          </View>

          <View style={styles.routeItem}>
            <Navigation size={16} color="#2563EB" />
            <View style={{ flex: 1 }}>
              <Text style={styles.waypointLabel}>Destination</Text>
              <Text style={styles.waypointVal}>Dumna Airport Terminal, Jabalpur</Text>
            </View>
          </View>
        </View>

        {/* Incident Button */}
        <Button
          title="Report Emergency / Delay / Breakdown"
          variant="secondary"
          size="md"
          icon={<AlertTriangle size={16} color={Colors.danger} />}
          textStyle={{ color: Colors.danger }}
          onPress={() => setIncidentModalVisible(true)}
          style={{ borderColor: '#FCA5A5', marginTop: Spacing.sm }}
        />
      </ScrollView>

      {/* Incident Modal */}
      <Modal
        visible={incidentModalVisible}
        onClose={() => setIncidentModalVisible(false)}
        title="Report Transit Incident"
      >
        <Text style={styles.modalText}>
          Logging an incident alerts the fleet operations manager and dispatches emergency roadside assistance if required.
        </Text>
        <Input
          placeholder="e.g. Flat tire on NH-30 or traffic congestion delay"
          value={incidentNote}
          onChangeText={setIncidentNote}
          containerStyle={{ marginTop: Spacing.md }}
        />
        <Button
          title="Submit Incident Report"
          variant="danger"
          size="md"
          onPress={handleReportIncident}
          style={{ marginTop: Spacing.sm }}
        />
      </Modal>
    </View>
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  stepsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBulletDone: {
    backgroundColor: '#7C3AED',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stepLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepLabelCurrent: {
    fontWeight: '700',
    color: Colors.navy,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  infoSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  waypointLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  waypointVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    marginTop: 1,
  },
  modalText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
