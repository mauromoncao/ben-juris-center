import { Stack } from 'expo-router'
import { AuthProvider } from '../src/components/AuthContext'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#0A1628" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthProvider>
  )
}
