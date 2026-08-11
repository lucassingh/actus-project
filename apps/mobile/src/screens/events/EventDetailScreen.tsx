import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { eventsService } from '../../services/events.service';
import { Event } from '../../types';
import { Header } from '../../components/common/Header';

type EventDetailRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const theme = useTheme();
  const route = useRoute<EventDetailRouteProp>();
  const navigation = useNavigation();
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error cargando evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!event) return;
    try {
      await eventsService.updateEvent(eventId, { status: 'RESOLVED' });
      loadEvent();
    } catch (error) {
      console.error('Error resolviendo evento:', error);
      Alert.alert('Error', 'No se pudo resolver el evento');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text>Evento no encontrado</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#0288d1';
      case 'IN_PROGRESS': return '#ed6c02';
      case 'RESOLVED': return '#2e7d32';
      case 'CLOSED': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return '#2e7d32';
      case 'MEDIUM': return '#ed6c02';
      case 'HIGH': return '#f57c00';
      case 'CRITICAL': return '#d32f2f';
      default: return '#9ca3af';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Baja';
      case 'MEDIUM': return 'Media';
      case 'HIGH': return 'Alta';
      case 'CRITICAL': return 'Crítica';
      default: return priority;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'INCIDENT': return 'Incidente';
      case 'MAINTENANCE': return 'Mantenimiento';
      case 'CONTROL': return 'Control';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'OPEN': return 'Abierto';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'RESOLVED': return 'Resuelto';
      case 'CLOSED': return 'Cerrado';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      <Header title={`Evento #${event.id}`} subtitle={event.title} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <View style={styles.pillsContainer}>
                <View style={styles.pillWrapper}>
                  <Text variant="labelSmall" style={[styles.pillLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Prioridad
                  </Text>
                  <Chip
                    style={[styles.pillChip, { backgroundColor: getPriorityColor(event.priority) + '20', borderColor: getPriorityColor(event.priority) }]}
                    textStyle={[styles.pillText, { color: getPriorityColor(event.priority) }]}
                  >
                    {getPriorityLabel(event.priority)}
                  </Chip>
                </View>
                <View style={styles.pillWrapper}>
                  <Text variant="labelSmall" style={[styles.pillLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Tipo
                  </Text>
                  <Chip
                    style={[styles.pillChip, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
                    textStyle={[styles.pillText, { color: theme.colors.onSurface }]}
                  >
                    {getEventTypeLabel(event.eventType)}
                  </Chip>
                </View>
              </View>
              <View style={styles.statusWrapper}>
                <Text variant="labelSmall" style={[styles.statusLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Estado
                </Text>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
                  textStyle={styles.statusText}
                >
                  {getStatusLabel(event.status)}
                </Chip>
              </View>
            </View>

            {event.machineName && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Máquina:</Text>
                <Text variant="bodyMedium">{event.machineName}</Text>
              </View>
            )}

            {event.location && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Ubicación:</Text>
                <Text variant="bodyMedium">{event.location}</Text>
              </View>
            )}

            {event.description && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Descripción</Text>
                <Text variant="bodyMedium">{event.description}</Text>
              </View>
            )}

            {event.problemContent && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Problema</Text>
                <Text variant="bodyMedium">{event.problemContent}</Text>
              </View>
            )}

            {event.solution && (
              <View style={styles.section}>
                <View style={[styles.solutionCard, { borderColor: '#2e7d32' }]}>
                  <View style={styles.solutionHeader}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text variant="labelMedium" style={styles.solutionCardTitle}>Solución aplicada</Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.solutionCardText}>{event.solution}</Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text variant="bodySmall" style={styles.date}>
                Creado: {new Date(event.createdAt).toLocaleString('es-ES')}
              </Text>
              {event.resolvedAt && (
                <Text variant="bodySmall" style={styles.date}>
                  Resuelto: {new Date(event.resolvedAt).toLocaleString('es-ES')}
                </Text>
              )}
            </View>

            {event.status === 'IN_PROGRESS' && (
              <Button mode="contained" onPress={handleResolve} style={styles.actionButton}>
                Marcar como Resuelto
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6F4' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 16 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pillsContainer: { flexDirection: 'row', gap: 12, flex: 1 },
  pillWrapper: { alignItems: 'flex-start' },
  statusWrapper: { alignItems: 'flex-end' },
  pillLabel: { fontSize: 11, marginBottom: 4, fontWeight: '500' },
  statusLabel: { fontSize: 11, marginBottom: 4, fontWeight: '500', textAlign: 'right' },
  pillChip: { borderWidth: 1, height: 28, justifyContent: 'center', alignItems: 'center' },
  pillText: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  statusChip: { justifyContent: 'center', alignItems: 'center' },
  statusText: { color: '#fff', fontWeight: '600', fontSize: 12, lineHeight: 16 },
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  label: { fontWeight: '600', marginRight: 8, minWidth: 100 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },
  date: { color: '#6b7280', marginTop: 4 },
  actionButton: { marginTop: 16 },
  solutionCard: { marginTop: 8, padding: 5, borderRadius: 8, borderWidth: 1, backgroundColor: '#f1f8f4' },
  solutionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkIcon: { fontSize: 20, color: '#2e7d32', fontWeight: 'bold', marginRight: 8 },
  solutionCardTitle: { fontWeight: '600', color: '#2e7d32' },
  solutionCardText: { lineHeight: 22, color: '#1b5e20' },
});
