import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { eventsService } from '../../services/events.service';
import { EventSummary } from '../../types';
import { Header } from '../../components/common/Header';
import { EventSearchBar } from '../../components/events/EventSearchBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EventsListScreen() {
  const theme = useTheme();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadEvents();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEvents(0);
    }, [])
  );

  const loadEvents = async (offset: number = 0) => {
    try {
      const response = await eventsService.getEvents(offset, 20);
      if (offset === 0) {
        setEvents(response.items);
      } else {
        setEvents((prev) => [...prev, ...response.items]);
      }
      setHasMore(response.has_more);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (searchQuery.trim()) {
      const searchId = parseInt(searchQuery.trim());
      filtered = !isNaN(searchId)
        ? filtered.filter((event) => event.id === searchId)
        : [];
    }

    if (selectedType) {
      filtered = filtered.filter((event) => event.eventType === selectedType);
    }

    if (selectedPriority) {
      filtered = filtered.filter((event) => event.priority === selectedPriority);
    }

    return filtered;
  }, [events, searchQuery, selectedType, selectedPriority]);

  const handleSearch = () => {};

  const handleTypeFilter = (type: string | null) => {
    setSelectedType(type);
    if (type && searchQuery) setSearchQuery('');
  };

  const handlePriorityFilter = (priority: string | null) => {
    setSelectedPriority(priority);
    if (priority && searchQuery) setSearchQuery('');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType(null);
    setSelectedPriority(null);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedType !== null || selectedPriority !== null;

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#0288d1';
      case 'IN_PROGRESS': return '#ed6c02';
      case 'RESOLVED': return '#2e7d32';
      case 'CLOSED': return '#6b7280';
      default: return '#9ca3af';
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

  const renderEvent = ({ item }: { item: EventSummary }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Card.Content>
        <View style={styles.eventHeader}>
          <Text variant="titleMedium" style={styles.eventTitle}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        {item.machineName && (
          <Text variant="bodySmall" style={styles.machineName}>
            Máquina: {item.machineName}
          </Text>
        )}
        <Text variant="bodySmall" style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('es-ES')}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading && events.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Mis Eventos" subtitle="Listado de todos tus eventos" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Mis Eventos" subtitle="Listado de todos tus eventos" />

      <EventSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        selectedType={selectedType}
        onTypeFilter={handleTypeFilter}
        selectedPriority={selectedPriority}
        onPriorityFilter={handlePriorityFilter}
      />

      {hasActiveFilters && (
        <View style={styles.clearFiltersContainer}>
          <Button
            mode="text"
            onPress={clearFilters}
            icon="close-circle"
            textColor={theme.colors.primary}
            style={styles.clearFiltersButton}
          >
            Limpiar filtros
          </Button>
        </View>
      )}

      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {hasActiveFilters ? (
              <>
                <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No se encontraron eventos con los filtros aplicados
                </Text>
                <Button mode="outlined" onPress={clearFilters} style={[styles.clearButton, { borderColor: theme.colors.primary }]} textColor={theme.colors.primary}>
                  Limpiar filtros
                </Button>
              </>
            ) : (
              <>
                <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No hay eventos aún
                </Text>
                <Button mode="contained" onPress={() => navigation.navigate('CreateEvent')} style={[styles.createButton, { backgroundColor: theme.colors.primary }]}>
                  Crear Primer Evento
                </Button>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  eventTitle: { flex: 1, fontWeight: '600', marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  machineName: { color: '#6b7280', marginBottom: 4 },
  date: { color: '#9ca3af' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginBottom: 16, color: '#6b7280' },
  createButton: { marginTop: 8 },
  clearFiltersContainer: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  clearFiltersButton: { alignSelf: 'flex-start' },
  clearButton: { marginTop: 8 },
});
