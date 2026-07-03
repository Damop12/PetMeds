import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mis Mascotas' }} />
      <Stack.Screen name="medicamentos" options={{ title: 'Medicamentos' }} />
      <Stack.Screen name="vacunas" options={{ title: 'Vacunas' }} />
      <Stack.Screen name="bano" options={{ title: 'Baños y Grooming' }} />
    </Stack>
  );
}