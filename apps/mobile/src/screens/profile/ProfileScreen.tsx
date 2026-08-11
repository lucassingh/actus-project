/**
 * Pantalla de Perfil - Refactorizada completamente
 * Diseño profesional con toda la información del usuario y empresa
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { authService } from '../../services/auth.service';
import { User } from '../../types';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const info = await authService.getCurrentUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
      // Si falla, usar la información del contexto
      if (user) {
        setUserInfo(user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador del Sistema';
      case 'SUPERVISOR': return 'Supervisor';
      case 'OPERATOR': return 'Operador';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'shield-account';
      case 'SUPERVISOR': return 'account-tie';
      case 'OPERATOR': return 'account-hard-hat';
      default: return 'account';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Mi Perfil" subtitle="Información de tu cuenta" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const displayName = userInfo?.name && userInfo?.lastname
    ? `${userInfo.name} ${userInfo.lastname}`
    : user ? `${user.name} ${user.lastname}`.trim() : 'Usuario';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Mi Perfil" subtitle="Información de tu cuenta" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Card de Perfil Principal */}
        <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.profileCardContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={80}
                  color={theme.colors.primary}
                />
              </View>
            </View>

            {/* Nombre */}
            <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onSurface }]}>
              {displayName}
            </Text>

            {/* Email */}
            <Text variant="bodyMedium" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
              {userInfo?.email || user?.email}
            </Text>

            {/* Rol Badge */}
            <View style={[styles.roleBadge, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons
                name={getRoleIcon(userInfo?.role || user?.role || 'OPERATOR')}
                size={18}
                color={theme.colors.primary}
              />
              <Text variant="labelMedium" style={[styles.roleText, { color: theme.colors.primary }]}>
                {getRoleLabel(userInfo?.role || user?.role || 'OPERATOR')}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Card de Información Personal */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Información Personal
            </Text>
            <Divider style={styles.divider} />

            {/* Nombre Completo */}
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Nombre Completo
                </Text>
                <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {displayName}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Email */}
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Email
                </Text>
                <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {userInfo?.email || user?.email || 'N/A'}
                </Text>
              </View>
            </View>

            {userInfo?.department && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <MaterialCommunityIcons
                      name="office-building-outline"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Departamento
                    </Text>
                    <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {userInfo.department}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Card de Información de Empresa */}
        {userInfo?.tenant && (
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Información de la Empresa
              </Text>
              <Divider style={styles.divider} />

              {/* Nombre de la Empresa */}
              <View style={styles.infoRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialCommunityIcons
                    name="office-building"
                    size={20}
                    color="#2e7d32"
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Empresa
                  </Text>
                  <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                    {userInfo.tenant.name}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Código de la Empresa */}
              <View style={styles.infoRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={20}
                    color="#2e7d32"
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Código
                  </Text>
                  <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                    {userInfo.tenant.code}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Botón de Cerrar Sesión - Estilo similar al frontend */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            {
              borderColor: theme.colors.primary,
              backgroundColor: 'transparent',
            },
          ]}
          contentStyle={styles.logoutButtonContent}
          labelStyle={[styles.logoutButtonLabel, { color: theme.colors.primary }]}
          icon={() => (
            <MaterialCommunityIcons 
              name="logout" 
              size={20} 
              color={theme.colors.primary} 
            />
          )}
        >
          Cerrar Sesión
        </Button>
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
  profileCard: {
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
  },
  email: {
    textAlign: 'center',
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  roleText: {
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    marginBottom: 4,
    fontSize: 12,
  },
  infoValue: {
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutButtonContent: {
    paddingVertical: 10,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
