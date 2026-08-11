/**
 * Bottom Navigation con 3 items: Inicio, Eventos, Perfil
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BottomNavigation: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const currentRoute = route.name;

  const handlePress = (routeName: 'Home' | 'EventsList' | 'Profile') => {
    if (routeName !== currentRoute) {
      navigation.navigate(routeName);
    }
  };

  const isActive = (routeName: string) => currentRoute === routeName;

  const navItems: Array<{
    route: 'Home' | 'EventsList' | 'Profile';
    label: string;
    iconActive: string;
    iconInactive: string;
  }> = [
    {
      route: 'Home',
      label: 'Inicio',
      iconActive: 'home',
      iconInactive: 'home-outline',
    },
    {
      route: 'EventsList',
      label: 'Eventos',
      iconActive: 'clipboard-list',
      iconInactive: 'clipboard-list-outline',
    },
    {
      route: 'Profile',
      label: 'Perfil',
      iconActive: 'account',
      iconInactive: 'account-outline',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: '#fff',
          borderTopColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {navItems.map((item) => {
        const active = isActive(item.route);
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => handlePress(item.route)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={active ? (item.iconActive as any) : (item.iconInactive as any)}
              size={24}
              color={active ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelSmall"
              style={[
                styles.label,
                {
                  color: active ? theme.colors.primary : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});

