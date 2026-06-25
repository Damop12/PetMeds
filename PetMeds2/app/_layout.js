import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mis Mascotas' }} />
      <Stack.Screen name="medicamentos" options={{ title: 'Medicamentos' }} />
    </Stack>
  );
}