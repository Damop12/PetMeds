import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🐾 PetMeds</Text>
      <Text style={styles.subtitulo}>Recordatorios para tu mascota</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});