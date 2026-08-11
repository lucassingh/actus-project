import React, { useCallback, useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Image } from 'react-native';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { lightTheme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

const CLERK_PUBLISHABLE_KEY = 'pk_test_Z29vZC1waXJhbmhhLTE2LmNsZXJrLmFjY291bnRzLmRldiQ';

// expo-secure-store token cache for Clerk session persistence
const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {}, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A2463' }}>
        <Image
          source={require('./assets/splash-screen.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <SafeAreaProvider>
            <PaperProvider theme={lightTheme}>
              <AuthProvider>
                <AppNavigator />
              </AuthProvider>
            </PaperProvider>
          </SafeAreaProvider>
        </View>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
