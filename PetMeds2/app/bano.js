import { guardarBanos, cargarBanos } from '../src/utils/storage';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
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

export default function BanoScreen() {
  const { id, nombre } = useLocalSearchParams();
  const tema = useStore((state) => state.tema);
  const t = temas[tema];

  const [banos, setBanos] = useState([]);
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState(formatearFecha(new Date()));
  const [proximo, setProximo] = useState('');
  const [notas, setNotas] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarCalendarioFecha, setMostrarCalendarioFecha] = useState(false);
  const [mostrarCalendarioProximo, setMostrarCalendarioProximo] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const data = await cargarBanos(id);
      setBanos(data);
    };
    cargar();
  }, []);

  const guardar = async (nuevaLista) => {
    setBanos(nuevaLista);
    await guardarBanos(id, nuevaLista);
  };

  const agregarOEditar = async () => {
    if (tipo === '' || fecha === '') return;

    if (editandoId) {
      const actualizada = banos.map((b) =>
        b.id === editandoId ? { ...b, tipo, fecha, proximo, notas } : b
      );
      await guardar(actualizada);
      setEditandoId(null);
    } else {
      const nuevo = {
        id: Date.now().toString(),
        tipo,
        fecha,
        proximo,
        notas,
      };
      await guardar([...banos, nuevo]);
    }

    setTipo('');
    setFecha(formatearFecha(new Date()));
    setProximo('');
    setNotas('');
  };

  const handleEditar = (item) => {
    setTipo(item.tipo);
    setFecha(item.fecha);
    setProximo(item.proximo || '');
    setNotas(item.notas || '');
    setEditandoId(item.id);
  };

  const handleEliminar = (itemId) => {
    Alert.alert('Eliminar registro', '¿Estás seguro que querés eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => guardar(banos.filter((b) => b.id !== itemId)),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.fondo }]}>
      <Text style={[styles.titulo, { color: t.texto }]}>🛁 Baños de {nombre}</Text>
      <Text style={[styles.subtitulo, { color: t.textoSecundario }]}>
        {banos.length} {banos.length === 1 ? 'registro' : 'registros'}
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.fondoInput, borderColor: t.borde, color: t.texto }]}
        placeholder="Tipo (ej: Baño completo, Corte de pelo...)"
        placeholderTextColor={t.textoSecundario}
        value={tipo}
        onChangeText={setTipo}
      />

      <TouchableOpacity
        style={[styles.inputFecha, { backgroundColor: t.fondoInput, borderColor: t.borde }]}
        onPress={() => setMostrarCalendarioFecha(true)}
      >
        <Text style={{ color: fecha ? t.texto : t.textoSecundario }}>
          📅 Fecha: {fecha}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.inputFecha, { backgroundColor: t.fondoInput, borderColor: t.borde }]}
        onPress={() => setMostrarCalendarioProximo(true)}
      >
        <Text style={{ color: proximo ? t.texto : t.textoSecundario }}>
          🔔 {proximo ? `Próximo baño: ${proximo}` : 'Próximo baño (opcional)'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { backgroundColor: t.fondoInput, borderColor: t.borde, color: t.texto }]}
        placeholder="Notas (opcional)"
        placeholderTextColor={t.textoSecundario}
        value={notas}
        onChangeText={setNotas}
      />

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
        isVisible={mostrarCalendarioProximo}
        mode="date"
        onConfirm={(date) => {
          setProximo(formatearFecha(date));
          setMostrarCalendarioProximo(false);
        }}
        onCancel={() => setMostrarCalendarioProximo(false)}
      />

      <TouchableOpacity style={[styles.boton, { backgroundColor: t.boton }]} onPress={agregarOEditar}>
        <Text style={[styles.botonTexto, { color: t.botonTexto }]}>
          {editandoId ? '✏️ Guardar Cambios' : '+ Agregar Registro'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={banos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.vacio, { color: t.textoSecundario }]}>No hay registros de baño todavía</Text>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.tarjeta, { backgroundColor: tema === 'colorful' ? t.avatares[index % t.avatares.length] : t.fondoTarjeta, borderColor: t.borde }]}>
            <View style={styles.tarjetaInfo}>
              <Text style={[styles.nombre, { color: tema === 'colorful' ? '#fff' : t.texto }]}>🛁 {item.tipo}</Text>
              <Text style={[styles.detalle, { color: tema === 'colorful' ? 'rgba(255,255,255,0.7)' : t.textoSecundario }]}>📅 Fecha: {item.fecha}</Text>
              {item.proximo ? (
                <Text style={[styles.detalle, { color: tema === 'colorful' ? 'rgba(255,255,255,0.9)' : t.boton }]}>🔔 Próximo: {item.proximo}</Text>
              ) : null}
              {item.notas ? (
                <Text style={[styles.detalle, { color: tema === 'colorful' ? 'rgba(255,255,255,0.7)' : t.textoSecundario }]}>📝 {item.notas}</Text>
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