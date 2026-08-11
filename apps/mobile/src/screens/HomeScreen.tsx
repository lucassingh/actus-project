/**
 * Pantalla de inicio (Home) con KPIs de eventos
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/common/Header';
import { KPICard } from '../components/common/KPICard';
import { eventsService } from '../services/events.service';
import { EventSummary } from '../types';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [, setEvents] = useState<EventSummary[]>([]);
  const [kpis, setKpis] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
  });

  useEffect(() => {
    // Cargar eventos de forma asíncrona sin bloquear la UI
    // Mostrar la UI primero con KPIs en 0, luego actualizar cuando cargue
    setLoading(false); // No bloquear la UI
    
    // Intentar cargar eventos, pero si falla, no bloquear la app
    loadEvents().catch(() => {
      // Silenciar errores - la UI ya se mostró
    });
  }, []);

  const loadEvents = async () => {
    try {
      // Solo cargar los primeros 5 eventos para calcular KPIs (más rápido)
      // Si hay muchos eventos, esto será suficiente para estadísticas aproximadas
      const response = await eventsService.getEvents(0, 5);
      setEvents(response.items);
      calculateKPIs(response.items);
    } catch (error: any) {
      console.error('Error cargando eventos:', error);
      // Si falla, mostrar KPIs en 0 y no bloquear la UI
      setKpis({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
      });
      // Si es timeout o network error, el backend probablemente no está respondiendo
      if (error.message?.includes('timeout') || error.message?.includes('Network Error')) {
        console.warn('⚠️ No se puede conectar con el backend. Verifica:');
        console.warn('   1. Que el backend esté corriendo: cd agent-api && python -m uvicorn app.main:app --reload --port 8000');
        console.warn('   2. Que tu celular y PC estén en la misma red WiFi');
        console.warn('   3. Que la IP sea correcta (verifica con ipconfig): http://192.168.0.5:8000');
        console.warn('   4. Que el firewall no esté bloqueando el puerto 8000');
        console.warn('   5. Prueba desde el navegador del celular: http://192.168.0.5:8000/docs');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const calculateKPIs = (eventsList: EventSummary[]) => {
    const total = eventsList.length;
    const open = eventsList.filter((e) => e.status === 'OPEN').length;
    const inProgress = eventsList.filter((e) => e.status === 'IN_PROGRESS').length;
    const resolved = eventsList.filter((e) => e.status === 'RESOLVED').length;
    const critical = eventsList.filter((e) => e.priority === 'CRITICAL').length;

    setKpis({
      total,
      open,
      inProgress,
      resolved,
      critical,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };
  // No bloquear la UI con loading, mostrar siempre el contenido
  // Los KPIs se actualizarán cuando carguen los eventos

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={`Bienvenido, ${user ? `${user.name} ${user.lastname}`.trim() : 'Usuario'}`}
        subtitle="Resumen de tus eventos"
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]} // Espacio para FAB
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.kpiGrid}>
          <KPICard
            title="Total de Eventos"
            value={kpis.total}
            icon="clipboard-list"
            color={theme.colors.primary}
            subtitle="Todos tus eventos"
          />
          <KPICard
            title="Abiertos"
            value={kpis.open}
            icon="alert-circle"
            color="#0288d1"
            subtitle="Pendientes de resolver"
          />
          <KPICard
            title="En Progreso"
            value={kpis.inProgress}
            icon="clock-outline"
            color="#ed6c02"
            subtitle="Trabajando en ellos"
          />
          <KPICard
            title="Resueltos"
            value={kpis.resolved}
            icon="check-circle"
            color="#2e7d32"
            subtitle="Completados"
          />
          <KPICard
            title="Críticos"
            value={kpis.critical}
            icon="alert"
            color="#d32f2f"
            subtitle="Requieren atención urgente"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiGrid: {
    width: '100%',
  },
});

