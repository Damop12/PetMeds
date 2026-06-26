import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import useStore from "../store";
import { temas } from "../temas";

export default function HomeScreen() {
  const router = useRouter();

  const tema = useStore((state) => state.tema);
  const setTema = useStore((state) => state.setTema);
  const cargarTema = useStore((state) => state.cargarTema);
  const mascotas = useStore((state) => state.mascotas);
  const cargarMascotas = useStore((state) => state.cargarMascotas);
  const agregarMascota = useStore((state) => state.agregarMascota);
  const editarMascota = useStore((state) => state.editarMascota);
  const eliminarMascota = useStore((state) => state.eliminarMascota);
  const actualizarFotoMascota = useStore(
    (state) => state.actualizarFotoMascota
  );

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const t = temas[tema];

  const emojis = {
    perro: "🐕",
    gato: "🐈",
    pájaro: "🐦",
    loro: "🦜",
    conejo: "🐇",
    pez: "🐟",
    tortuga: "🐢",
    hamster: "🐹",
  };
  const getEmoji = (tipo) => emojis[tipo.toLowerCase()] || "🐾";

  useEffect(() => {
    cargarTema();
    cargarMascotas();
  }, []);

  const agregarOEditar = async () => {
    if (nombre === "" || tipo === "") return;
    if (editandoId) {
      await editarMascota(editandoId, nombre, tipo);
      setEditandoId(null);
    } else {
      await agregarMascota(nombre, tipo);
    }
    setNombre("");
    setTipo("");
  };

  const handleEditar = (mascota) => {
    setNombre(mascota.nombre);
    setTipo(mascota.tipo);
    setEditandoId(mascota.id);
  };

  const handleEliminar = (id) => {
    Alert.alert("Eliminar mascota", "¿Estás seguro que querés eliminarla?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => eliminarMascota(id),
      },
    ]);
  };

  const elegirFoto = async (mascotaId) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tu galería para elegir una foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      await actualizarFotoMascota(mascotaId, result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.fondo }]}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { backgroundColor: tema === "minimal" ? t.boton : t.borde },
          ]}
          onPress={() => setTema("minimal")}
        >
          <Text
            style={[
              styles.toggleTexto,
              { color: tema === "minimal" ? "#fff" : t.textoSecundario },
            ]}
          >
            Minimal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { backgroundColor: tema === "colorful" ? "#e94560" : t.borde },
          ]}
          onPress={() => setTema("colorful")}
        >
          <Text
            style={[
              styles.toggleTexto,
              { color: tema === "colorful" ? "#fff" : t.textoSecundario },
            ]}
          >
            Color
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.titulo, { color: t.texto }]}>🐾 Mis Mascotas</Text>
      <Text style={[styles.subtitulo, { color: t.textoSecundario }]}>
        {mascotas.length}{" "}
        {mascotas.length === 1 ? "mascota registrada" : "mascotas registradas"}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: t.fondoInput,
            borderColor: t.borde,
            color: t.texto,
          },
        ]}
        placeholder="Nombre de la mascota"
        placeholderTextColor={t.textoSecundario}
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: t.fondoInput,
            borderColor: t.borde,
            color: t.texto,
          },
        ]}
        placeholder="Tipo (Perro, Gato...)"
        placeholderTextColor={t.textoSecundario}
        value={tipo}
        onChangeText={setTipo}
      />
      <TouchableOpacity
        style={[styles.boton, { backgroundColor: t.boton }]}
        onPress={agregarOEditar}
      >
        <Text style={[styles.botonTexto, { color: t.botonTexto }]}>
          {editandoId ? "✏️ Guardar Cambios" : "+ Agregar Mascota"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={mascotas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.vacio, { color: t.textoSecundario }]}>
            No hay mascotas todavía
          </Text>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.tarjeta,
              {
                backgroundColor: t.avatares[index % t.avatares.length],
                borderColor: t.borde,
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/medicamentos",
                params: { id: item.id, nombre: item.nombre },
              })
            }
          >
            {item.foto ? (
              <TouchableOpacity onPress={() => elegirFoto(item.id)}>
                <Image source={{ uri: item.foto }} style={styles.avatarFoto} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => elegirFoto(item.id)}>
                <Text style={styles.avatar}>{getEmoji(item.tipo)}</Text>
              </TouchableOpacity>
            )}
            <View style={styles.tarjetaInfo}>
              <Text
                style={[
                  styles.nombre,
                  { color: tema === "colorful" ? "#fff" : t.texto },
                ]}
              >
                {item.nombre}
              </Text>
              <Text
                style={[
                  styles.tipo,
                  {
                    color:
                      tema === "colorful"
                        ? "rgba(255,255,255,0.7)"
                        : t.textoSecundario,
                  },
                ]}
              >
                {item.tipo}
              </Text>
            </View>
            <View style={styles.tarjetaBotones}>
              <TouchableOpacity onPress={() => handleEditar(item)}>
                <Text style={styles.btnIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEliminar(item.id)}>
                <Text style={styles.btnIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 50,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  toggleTexto: {
    fontSize: 13,
    fontWeight: "500",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
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
    alignItems: "center",
    marginBottom: 20,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tarjeta: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 0.5,
  },
  avatar: {
    fontSize: 28,
  },
  avatarFoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  tarjetaInfo: {
    flex: 1,
  },
  tarjetaBotones: {
    flexDirection: "row",
    gap: 10,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tipo: {
    fontSize: 13,
    marginTop: 2,
  },
  btnIcon: {
    fontSize: 18,
  },
  vacio: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
