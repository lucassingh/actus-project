import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  EventsList: undefined;
  EventDetail: { eventId: number };
  CreateEvent: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthenticatedLayout: React.FC<{ children: React.ReactNode; showFAB?: boolean }> = ({
  children,
  showFAB = true,
}) => (
  <View style={styles.authenticatedContainer}>
    {children}
    {showFAB && <FloatingActionButton />}
    <BottomNavigation />
  </View>
);

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#3a55b4' }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home">
              {() => (
                <AuthenticatedLayout>
                  <HomeScreen />
                </AuthenticatedLayout>
              )}
            </Stack.Screen>
            <Stack.Screen name="EventsList">
              {() => (
                <AuthenticatedLayout>
                  <EventsListScreen />
                </AuthenticatedLayout>
              )}
            </Stack.Screen>
            <Stack.Screen name="EventDetail">
              {() => (
                <AuthenticatedLayout showFAB={false}>
                  <EventDetailScreen />
                </AuthenticatedLayout>
              )}
            </Stack.Screen>
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile">
              {() => (
                <AuthenticatedLayout showFAB={false}>
                  <ProfileScreen />
                </AuthenticatedLayout>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  authenticatedContainer: { flex: 1 },
});
