/**
 * Componente de búsqueda y filtros para eventos
 * Estilo sutil, delicado y profesional
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Chip, Text, useTheme } from 'react-native-paper';

interface EventSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  selectedType: string | null;
  onTypeFilter: (type: string | null) => void;
  selectedPriority: string | null;
  onPriorityFilter: (priority: string | null) => void;
}

export function EventSearchBar({
  searchQuery,
  onSearchChange,
  onSearch,
  selectedType,
  onTypeFilter,
  selectedPriority,
  onPriorityFilter,
}: EventSearchBarProps) {
  const theme = useTheme();

  const eventTypes = [
    { value: 'INCIDENT', label: 'Incidente' },
    { value: 'MAINTENANCE', label: 'Mantenimiento' },
    { value: 'CONTROL', label: 'Control' },
  ];

  const priorities = [
    { value: 'LOW', label: 'Baja', color: '#4caf50', lightColor: '#e8f5e9' },
    { value: 'MEDIUM', label: 'Media', color: '#ff9800', lightColor: '#fff3e0' },
    { value: 'HIGH', label: 'Alta', color: '#ff5722', lightColor: '#ffccbc' },
    { value: 'CRITICAL', label: 'Crítica', color: '#d32f2f', lightColor: '#ffcdd2' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Título de la sección */}
      <View style={styles.header}>
        <Text 
          style={[
            styles.sectionTitle, 
            { color: theme.colors.primary }
          ]}
          variant="titleSmall"
        >
          Buscar y filtrar eventos
        </Text>
        <View style={[styles.titleDivider, { backgroundColor: theme.colors.primaryContainer }]} />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            mode="outlined"
            placeholder="Buscar por ID (ej: 15, 12)..."
            value={searchQuery}
            onChangeText={onSearchChange}
            style={[
              styles.searchInput, 
              { backgroundColor: theme.colors.surface }
            ]}
            contentStyle={styles.searchInputContent}
            outlineStyle={[styles.searchInputOutline, { 
              borderColor: theme.colors.outline 
            }]}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={onSearch}
            left={
              <TextInput.Icon 
                icon="magnify" 
                color={theme.colors.primary} 
                size={20}
              />
            }
            theme={{ 
              roundness: 10,
              colors: {
                primary: theme.colors.primary,
                outline: theme.colors.outline,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
          <Button
            mode="contained"
            onPress={onSearch}
            style={[
              styles.searchButton, 
              { backgroundColor: theme.colors.primary }
            ]}
            contentStyle={styles.searchButtonContent}
            labelStyle={[
              styles.searchButtonLabel, 
              { color: '#FFFFFF' } // Texto blanco para mejor contraste
            ]}
            theme={{ roundness: 10 }}
          >
            Buscar
          </Button>
        </View>
        
        <Text 
          style={[
            styles.searchHint, 
            { color: theme.colors.onSurfaceVariant }
          ]}
          variant="bodySmall"
        >
          Introduce uno o varios IDs separados por comas
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {/* Filtro por Tipo */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <View style={styles.iconContainer}>
              <TextInput.Icon 
                icon="tag-multiple" 
                size={16}
                color={theme.colors.primary}
              />
            </View>
            <Text 
              style={[
                styles.filterLabel, 
                { color: theme.colors.onSurface }
              ]}
              variant="labelMedium"
            >
              Tipo de evento
            </Text>
          </View>
          <View style={styles.pillsContainer}>
            {eventTypes.map((type) => (
              <Chip
                key={type.value}
                selected={selectedType === type.value}
                onPress={() => onTypeFilter(selectedType === type.value ? null : type.value)}
                style={[
                  styles.pill,
                  selectedType === type.value && {
                    backgroundColor: theme.colors.primaryContainer,
                    borderColor: theme.colors.primary,
                  },
                  !selectedType && {
                    backgroundColor: 'transparent',
                    borderColor: theme.colors.outline,
                  }
                ]}
                textStyle={[
                  styles.pillText,
                  selectedType === type.value && {
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: '600',
                  },
                  !selectedType && {
                    color: theme.colors.onSurface,
                    fontWeight: '500',
                  }
                ]}
                theme={{ roundness: 6 }}
                showSelectedOverlay={false}
              >
                {type.label}
              </Chip>
            ))}
            {selectedType && (
              <Chip
                icon="close"
                onPress={() => onTypeFilter(null)}
                style={[
                  styles.clearPill,
                  { 
                    backgroundColor: theme.colors.surfaceVariant + '15',
                    borderColor: theme.colors.outline 
                  }
                ]}
                textStyle={[
                  styles.clearPillText,
                  { color: theme.colors.onSurfaceVariant }
                ]}
                theme={{ roundness: 6 }}
              >
                Limpiar
              </Chip>
            )}
          </View>
        </View>

        {/* Filtro por Prioridad */}
        <View style={[styles.filterSection, styles.prioritySection]}>
          <View style={styles.filterHeader}>
            <View style={styles.iconContainer}>
              <TextInput.Icon 
                icon="flag" 
                size={16}
                color={theme.colors.primary}
              />
            </View>
            <Text 
              style={[
                styles.filterLabel, 
                { color: theme.colors.onSurface }
              ]}
              variant="labelMedium"
            >
              Nivel de prioridad
            </Text>
          </View>
          <View style={styles.pillsContainer}>
            {priorities.map((priority) => (
              <Chip
                key={priority.value}
                selected={selectedPriority === priority.value}
                onPress={() => onPriorityFilter(selectedPriority === priority.value ? null : priority.value)}
                style={[
                  styles.priorityPill,
                  selectedPriority === priority.value && {
                    backgroundColor: priority.color,
                    borderColor: priority.color,
                  },
                  !selectedPriority && {
                    backgroundColor: priority.lightColor,
                    borderColor: priority.color + '60',
                  }
                ]}
                textStyle={[
                  styles.priorityPillText,
                  selectedPriority === priority.value && {
                    color: '#FFFFFF',
                    fontWeight: '600',
                  },
                  !selectedPriority && {
                    color: priority.color,
                    fontWeight: '500',
                  }
                ]}
                theme={{ roundness: 6 }}
                showSelectedOverlay={false}
              >
                {priority.label}
              </Chip>
            ))}
            {selectedPriority && (
              <Chip
                icon="close"
                onPress={() => onPriorityFilter(null)}
                style={[
                  styles.clearPill,
                  { 
                    backgroundColor: theme.colors.surfaceVariant + '15',
                    borderColor: theme.colors.outline 
                  }
                ]}
                textStyle={[
                  styles.clearPillText,
                  { color: theme.colors.onSurfaceVariant }
                ]}
                theme={{ roundness: 6 }}
              >
                Limpiar
              </Chip>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    letterSpacing: 0.15,
    marginBottom: 6,
    fontSize: 14,
  },
  titleDivider: {
    height: 2,
    width: 36,
    borderRadius: 1,
  },
  searchSection: {
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },
  searchInputContent: {
    height: 44,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  searchInputOutline: {
    borderRadius: 10,
    borderWidth: 1,
  },
  searchButton: {
    height: 44,
    justifyContent: 'center',
    borderRadius: 10,
    minWidth: 90,
    elevation: 0,
    shadowOpacity: 0,
  },
  searchButtonContent: {
    height: 44,
    paddingHorizontal: 0,
  },
  searchButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  searchHint: {
    marginLeft: 2,
    fontStyle: 'italic',
    fontSize: 11,
  },
  filtersContainer: {
    gap: 14, // Reducido para menos altura
  },
  filterSection: {
    gap: 8, // Reducido para menos espacio entre título y pills
  },
  prioritySection: {
    // Sección de prioridad con ajustes específicos si es necesario
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 0, // Espacio mínimo entre título y pills
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterLabel: {
    fontWeight: '600',
    fontSize: 11,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    height: 32, // Más pequeña
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    paddingHorizontal: 0, // Menos padding horizontal
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 14,
  },
  priorityPill: {
    height: 30, // Más pequeña
    borderRadius: 6,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    paddingHorizontal: 0, // Menos padding horizontal
  },
  priorityPillText: {
    fontSize: 11.5,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 14,
  },
  clearPill: {
    height: 32, // Más pequeña
    borderRadius: 6,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    paddingHorizontal: 0, // Menos padding horizontal
  },
  clearPillText: {
    fontSize: 11.5,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 14,
  },
});