import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import useStore from '../src/store';
import { temas } from '../src/temas';
import {
  programarNotificacion,
  cancelarNotificacion,
  pedirPermisos,
} from '../src/utils/notificaciones';

export default function MedicamentosScreen() {
  const { id, nombre } = useLocalSearchParams();

  const tema = useStore((state) => state.tema);
  const t = temas[tema];

  const medicamentos = useStore((state) => state.medicamentos[id]) || [];
  const cargarMedicamentos = useStore((state) => state.cargarMedicamentos);
  const agregarMedicamento = useStore((state) => state.agregarMedicamento);
  const editarMedicamento = useStore((state) => state.editarMedicamento);
  const eliminarMedicamento = useStore((state) => state.eliminarMedicamento);

  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [hora, setHora] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    pedirPermisos();
    cargarMedicamentos(id);
  }, []);

  const agregarOEditar = async () => {
    if (medicamento === '' || dosis === '' || hora === '') return;

    if (editandoId) {
      await cancelarNotificacion(editandoId);
      await programarNotificacion(editandoId, nombre, medicamento, hora);
      await editarMedicamento(id, editandoId, medicamento, dosis, hora);
      setEditandoId(null);
    } else {
      const notifId = Date.now().toString();
      await programarNotificacion(notifId, nombre, medicamento, hora);
      await agregarMedicamento(id, medicamento, dosis, hora);
    }

    setMedicamento('');
    setDosis('');
    setHora('');
  };

  const handleEditar = (item) => {
    setMedicamento(item.medicamento);
    setDosis(item.dosis);
    setHora(item.hora);
    setEditandoId(item.id);
  };

  const handleEliminar = (itemId) => {
    Alert.alert('Eliminar medicamento', '¿Estás seguro que querés eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await cancelarNotificacion(itemId);
          await eliminarMedicamento(id, itemId);
        },
      },
    ]);
  };

  const compartirMedicamentos = async () => {
    if (medicamentos.length === 0) {
      Alert.alert('Sin medicamentos', 'No hay medicamentos para compartir');
      return;
    }
    const texto = medicamentos
      .map((m) => `💊 ${m.medicamento}\n   Dosis: ${m.dosis}\n   Hora: ⏰ ${m.hora}`)
      .join('\n\n');
    await Share.share({ message: `🐾 Medicamentos de ${nombre}:\n\n${texto}` });
  };

  return (
    <View style={[styles.container, { backgroundColor: t.fondo }]}>
      <Text style={[styles.titulo, { color: t.texto }]}>💊 {nombre}</Text>
      <Text style={[styles.subtitulo, { color: t.textoSecundario }]}>
        {medicamentos.length} {medicamentos.length === 1 ? 'medicamento' : 'medicamentos'}
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.fondoInput, borderColor: t.borde, color: t.texto }]}
        placeholder="Nombre del medicamento"
        placeholderTextColor={t.textoSecundario}
        value={medicamento}
        onChangeText={setMedicamento}
      />
      <TextInput
        style={[styles.input, { backgroundColor: t.fondoInput, borderColor: t.borde, color: t.texto }]}
        placeholder="Dosis (ej: 1 pastilla)"
        placeholderTextColor={t.textoSecundario}
        value={dosis}
        onChangeText={setDosis}
      />
      <TextInput
        style={[styles.input, { backgroundColor: t.fondoInput, borderColor: t.borde, color: t.texto }]}
        placeholder="Hora (ej: 08:00)"
        placeholderTextColor={t.textoSecundario}
        value={hora}
        onChangeText={setHora}
      />

      <TouchableOpacity style={[styles.boton, { backgroundColor: t.boton }]} onPress={agregarOEditar}>
        <Text style={[styles.botonTexto, { color: t.botonTexto }]}>
          {editandoId ? '✏️ Guardar Cambios' : '+ Agregar Medicamento'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botonCompartir, { backgroundColor: '#25D366' }]} onPress={compartirMedicamentos}>
        <Text style={styles.botonTexto}>📤 Compartir por WhatsApp</Text>
      </TouchableOpacity>

      <FlatList
        data={medicamentos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.vacio, { color: t.textoSecundario }]}>No hay medicamentos todavía</Text>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.tarjeta, { backgroundColor: tema === 'colorful' ? t.avatares[index % t.avatares.length] : t.fondoTarjeta, borderColor: t.borde }]}>
            <View style={styles.tarjetaInfo}>
              <Text style={[styles.nombre, { color: tema === 'colorful' ? '#fff' : t.texto }]}>{item.medicamento}</Text>
              <Text style={[styles.dosis, { color: tema === 'colorful' ? 'rgba(255,255,255,0.7)' : t.textoSecundario }]}>💊 {item.dosis}</Text>
              <Text style={[styles.hora, { color: tema === 'colorful' ? 'rgba(255,255,255,0.9)' : t.boton }]}>⏰ {item.hora}</Text>
            </View>
            <View style={styles.tarjetaBotones}>
              <TouchableOpacity onPress={() => handleEditar(item)}>
                <Text style={styles.btnIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEliminar(item.id)}>
                <Text style={styles.btnIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  boton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  botonCompartir: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tarjeta: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  tarjetaInfo: {
    flex: 1,
  },
  tarjetaBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dosis: {
    fontSize: 13,
    marginTop: 4,
  },
  hora: {
    fontSize: 13,
    marginTop: 4,
  },
  btnIcon: {
    fontSize: 18,
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});