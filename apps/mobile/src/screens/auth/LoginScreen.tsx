import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignIn } from '@clerk/clerk-expo';
import BigLogo from '../../../assets/big-logo.svg';

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState(__DEV__ ? '' : '');
  const [password, setPassword] = useState(__DEV__ ? '' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // AppNavigator reacts automatically to Clerk's isSignedIn change
      } else {
        setError('No se pudo iniciar sesión. Verifica tus credenciales.');
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';

      if (clerkError) {
        switch (clerkError.code) {
          case 'form_password_incorrect':
            errorMessage = 'Contraseña incorrecta.';
            break;
          case 'form_identifier_not_found':
            errorMessage = 'No existe una cuenta con este email.';
            break;
          case 'too_many_requests':
            errorMessage = 'Demasiados intentos. Espera unos minutos.';
            break;
          default:
            errorMessage = clerkError.longMessage || clerkError.message || errorMessage;
        }
      } else if (err.message?.includes('Network') || err.code === 'ERR_NETWORK') {
        errorMessage = '🔴 Sin conexión. Verifica tu red.';
      }

      setError(errorMessage);

      if (__DEV__) {
        console.error('Login error:', err);
      }
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
            <View style={styles.logoContainer}>
              <BigLogo width={200} height={60} style={styles.logo} />
            </View>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Inicia sesión en tu cuenta
            </Text>

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
                  {error}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />

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
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || !isLoaded}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardContent: { padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 200, height: 80, maxWidth: '100%' },
  subtitle: { textAlign: 'center', marginBottom: 32 },
  errorContainer: { padding: 12, borderRadius: 8, marginBottom: 20 },
  error: { textAlign: 'center' },
  form: { width: '100%' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  inputContent: { height: 56 },
  button: { marginTop: 8, borderRadius: 12, elevation: 0 },
  buttonContent: { paddingVertical: 8 },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
});
