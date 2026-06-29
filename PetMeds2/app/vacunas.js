import { guardarVacunas, cargarVacunas } from '../src/utils/storage';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import useStore from '../src/store';
import { temas } from '../src/temas';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const formatearFecha = (date) => {
  const d = new Date(date);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

export default function VacunasScreen() {
  const { id, nombre } = useLocalSearchParams();
  const tema = useStore((state) => state.tema);
  const t = temas[tema];

  const [vacunas, setVacunas] = useState([]);
  const [vacuna, setVacuna] = useState('');
  const [fecha, setFecha] = useState(formatearFecha(new Date()));
  const [proxima, setProxima] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarCalendarioFecha, setMostrarCalendarioFecha] = useState(false);
  const [mostrarCalendarioProxima, setMostrarCalendarioProxima] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const data = await cargarVacunas(id);
      setVacunas(data);
    };
    cargar();
  }, []);

  const guardar = async (nuevaLista) => {
    setVacunas(nuevaLista);
    await guardarVacunas(id, nuevaLista);
  };
  const agregarOEditar = () => {
    if (vacuna === '' || fecha === '') return;

    if (editandoId) {
      const actualizada = vacunas.map((v) =>
        v.id === editandoId ? { ...v, vacuna, fecha, proxima } : v
      );
      guardar(actualizada);
      setEditandoId(null);
    } else {
      const nueva = {
        id: Date.now().toString(),
        vacuna,
        fecha,
        proxima,
      };
      guardar([...vacunas, nueva]);
    }

    setVacuna('');
    setFecha(formatearFecha(new Date()));
    setProxima('');
  };

  const handleEditar = (item) => {
    setVacuna(item.vacuna);
    setFecha(item.fecha);
    setProxima(item.proxima || '');
    setEditandoId(item.id);
  };

  const handleEliminar = (itemId) => {
    Alert.alert('Eliminar vacuna', '¿Estás seguro que querés eliminarla?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => guardar(vacunas.filter((v) => v.id !== itemId)),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.fondo }]}>
      <Text style={[styles.titulo, { color: t.texto }]}>💉 Vacunas de {nombre}</Text>
      <Text style={[styles.subtitulo, { color: t.textoSecundario }]}>
        {vacunas.length} {vacunas.length === 1 ? 'vacuna registrada' : 'vacunas registradas'}
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.fondoInput, borderColor: t.borde, color: t.texto }]}
        placeholder="Nombre de la vacuna"
        placeholderTextColor={t.textoSecundario}
        value={vacuna}
        onChangeText={setVacuna}
      />

      <TouchableOpacity
        style={[styles.inputFecha, { backgroundColor: t.fondoInput, borderColor: t.borde }]}
        onPress={() => setMostrarCalendarioFecha(true)}
      >
        <Text style={{ color: fecha ? t.texto : t.textoSecundario }}>
          📅 Fecha de aplicación: {fecha}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.inputFecha, { backgroundColor: t.fondoInput, borderColor: t.borde }]}
        onPress={() => setMostrarCalendarioProxima(true)}
      >
        <Text style={{ color: proxima ? t.texto : t.textoSecundario }}>
          🔔 {proxima ? `Próxima dosis: ${proxima}` : 'Próxima dosis (opcional)'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={mostrarCalendarioFecha}
        mode="date"
        onConfirm={(date) => {
          setFecha(formatearFecha(date));
          setMostrarCalendarioFecha(false);
        }}
        onCancel={() => setMostrarCalendarioFecha(false)}
      />

      <DateTimePickerModal
        isVisible={mostrarCalendarioProxima}
        mode="date"
        onConfirm={(date) => {
          setProxima(formatearFecha(date));
          setMostrarCalendarioProxima(false);
        }}
        onCancel={() => setMostrarCalendarioProxima(false)}
      />

      <TouchableOpacity style={[styles.boton, { backgroundColor: t.boton }]} onPress={agregarOEditar}>
        <Text style={[styles.botonTexto, { color: t.botonTexto }]}>
          {editandoId ? '✏️ Guardar Cambios' : '+ Agregar Vacuna'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={vacunas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.vacio, { color: t.textoSecundario }]}>No hay vacunas registradas</Text>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.tarjeta, { backgroundColor: tema === 'colorful' ? t.avatares[index % t.avatares.length] : t.fondoTarjeta, borderColor: t.borde }]}>
            <View style={styles.tarjetaInfo}>
              <Text style={[styles.nombre, { color: tema === 'colorful' ? '#fff' : t.texto }]}>💉 {item.vacuna}</Text>
              <Text style={[styles.detalle, { color: tema === 'colorful' ? 'rgba(255,255,255,0.7)' : t.textoSecundario }]}>📅 Aplicada: {item.fecha}</Text>
              {item.proxima ? (
                <Text style={[styles.detalle, { color: tema === 'colorful' ? 'rgba(255,255,255,0.9)' : t.boton }]}>🔔 Próxima: {item.proxima}</Text>
              ) : null}
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
    fontSize: 24,
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
  inputFecha: {
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
  detalle: {
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