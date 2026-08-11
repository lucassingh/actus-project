/**
 * Componente Header reutilizable
 * Similar al Jumbotron del frontend
 * Con SafeArea para evitar el notch del iPhone
 */
import React from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Padding superior: safe area + padding adicional
  const topPadding = insets.top + 16;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primary,
          opacity: fadeAnim,
          paddingTop: topPadding,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[
            styles.title,
            {
              color: theme.colors.onPrimary,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="bodyMedium"
            style={[
              styles.subtitle,
              {
                color: theme.colors.onPrimary,
                opacity: 0.9,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
});

