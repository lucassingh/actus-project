import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { TextInput, Button, Text, Card, useTheme, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';
import BigLogo from '../../../assets/big-logo.svg';

type FirstAccessRouteParams = {
  code?: string;
  tenant_code?: string;
};

type RouteParams = {
  FirstAccess: FirstAccessRouteParams;
};

export default function FirstAccessScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'FirstAccess'>>();
  const { login } = useAuth();

  // Obtener parámetros de la URL o del route cuando este desplegada la app
  //   const [invitationCode, setInvitationCode] = useState<string>(
  //     route.params?.code || ''
  //   );
  //   const [tenantCode, setTenantCode] = useState<string>(
  //     route.params?.tenant_code || ''
  //   );
  // Línea 38-43, cambia temporalmente:
  const [invitationCode, setInvitationCode] = useState<string>('2BBDF17C');
  const [tenantCode, setTenantCode] = useState<string>('ABC123');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  // Si vienen parámetros del route, prellenar los campos
  useEffect(() => {
    if (route.params?.code && !invitationCode) {
      setInvitationCode(route.params.code);
    }
    if (route.params?.tenant_code && !tenantCode) {
      setTenantCode(route.params.tenant_code);
    }
  }, [route.params]);

  // Intentar obtener parámetros de la URL si vienen del link
  useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        parseUrlParams(initialUrl);
      }

      // Escuchar URLs mientras la app está abierta
      const subscription = Linking.addEventListener('url', (event) => {
        parseUrlParams(event.url);
      });

      return () => {
        subscription.remove();
      };
    };

    handleDeepLink();
  }, []);

  const parseUrlParams = (url: string) => {
    try {
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const tenant_code = urlObj.searchParams.get('tenant_code');

      if (code && !invitationCode) {
        setInvitationCode(code);
      }
      if (tenant_code && !tenantCode) {
        setTenantCode(tenant_code);
      }
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
  };

  const validateInvitation = async () => {
    if (!invitationCode || !tenantCode) {
      setError('Por favor completa el código de invitación y el código de empresa');
      return false;
    }

    setValidating(true);
    setError(null);

    try {
      // Validar la invitación antes de proceder
      const response = await fetch(
        `${API_BASE_URL}/invitations/validate/${invitationCode}?tenant_code=${tenantCode}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Código de invitación inválido');
      }

      return true;
    } catch (err: any) {
      setError(
        err.message ||
        'El código de invitación es inválido o ha expirado. Por favor, solicita una nueva invitación a tu supervisor.'
      );
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleFirstAccess = async () => {
    if (!invitationCode || !tenantCode) {
      setError('Por favor completa el código de invitación y el código de empresa');
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al endpoint de first-access
      const response = await authService.firstAccess(invitationCode, tenantCode, password);

      // Si el first-access fue exitoso, el usuario ya está autenticado
      // La navegación se manejará automáticamente por el AppNavigator
      Alert.alert(
        '¡Bienvenido!',
        'Tu cuenta ha sido creada exitosamente. Ya puedes usar la aplicación.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Error en primer acceso:', err);
      let errorMessage = 'Error al crear tu cuenta. Por favor, intenta de nuevo.';

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <BigLogo
                width={200}
                height={60}
                style={styles.logo}
              />
            </View>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              Primer Acceso
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {tenantCode && (route.params?.tenant_code || tenantCode)
                ? `Crea tu cuenta para la empresa ${tenantCode}`
                : 'Completa el formulario para crear tu cuenta de operador'}
            </Text>

            {/* Error message */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
                  {error}
                </Text>
              </View>
            )}

            {/* Formulario */}
            <View style={styles.form}>
              <TextInput
                label="Código de Invitación"
                value={invitationCode}
                onChangeText={setInvitationCode}
                mode="outlined"
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                editable={false}
                disabled={true}
              />

              <View>
                <TextInput
                  label="Código de Empresa"
                  value={tenantCode}
                  onChangeText={setTenantCode}
                  mode="outlined"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  editable={false}
                  disabled={true}
                />
                <HelperText type="info" visible={true}>
                  Este código viene del link de invitación
                </HelperText>
              </View>

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCorrect={false}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                editable={!loading}
              />

              <TextInput
                label="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCorrect={false}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <MaterialCommunityIcons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                editable={!loading}
              />

              <Button
                mode="contained"
                onPress={handleFirstAccess}
                loading={loading}
                disabled={loading || validating}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Login' as never)}
                disabled={loading}
                style={styles.linkButton}
              >
                Ya tengo cuenta, iniciar sesión
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 80,
    maxWidth: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  error: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputContent: {
    height: 56,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
  },
});
