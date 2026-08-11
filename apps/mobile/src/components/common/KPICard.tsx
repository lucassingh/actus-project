/**
 * Card de KPI para mostrar métricas de eventos
 */
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
}) => {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <Card.Content style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon as any} size={28} color={color} />
          </View>
          <View style={styles.textContainer}>
            <Text variant="labelMedium" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
              {title}
            </Text>
            <Text variant="headlineSmall" style={[styles.value, { color: theme.colors.onSurface }]}>
              {value}
            </Text>
            {subtitle && (
              <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});


