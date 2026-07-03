import { Picker } from "@react-native-picker/picker";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import useStore from "../src/store";
import { temas } from "../src/temas";
import {
  programarNotificacion,
  cancelarNotificacion,
  pedirPermisos,
} from "../src/utils/notificaciones";

export default function MedicamentosScreen() {
  const { id, nombre } = useLocalSearchParams();
  const router = useRouter();

  const tema = useStore((state) => state.tema);
  const t = temas[tema];

  const medicamentos = useStore((state) => state.medicamentos[id]) || [];
  const cargarMedicamentos = useStore((state) => state.cargarMedicamentos);
  const agregarMedicamento = useStore((state) => state.agregarMedicamento);
  const editarMedicamento = useStore((state) => state.editarMedicamento);
  const eliminarMedicamento = useStore((state) => state.eliminarMedicamento);

  const [modalVisible, setModalVisible] = useState(false);
  const [medicamento, setMedicamento] = useState("");
  const [dosis, setDosis] = useState("");
  const [hora, setHora] = useState("");
  const [frecuencia, setFrecuencia] = useState("diaria");
  const [vencimiento, setVencimiento] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    pedirPermisos();
    cargarMedicamentos(id);
  }, []);

  const limpiarFormulario = () => {
    setMedicamento("");
    setDosis("");
    setHora("");
    setFrecuencia("diaria");
    setVencimiento("");
    setEditandoId(null);
  };

  const agregarOEditar = async () => {
    if (medicamento === "" || dosis === "" || hora === "") return;

    if (editandoId) {
      await cancelarNotificacion(editandoId);
      await programarNotificacion(
        editandoId,
        nombre,
        medicamento,
        hora,
        frecuencia
      );
      await editarMedicamento(
        id,
        editandoId,
        medicamento,
        dosis,
        hora,
        frecuencia,
        vencimiento
      );
      setEditandoId(null);
    } else {
      const notifId = Date.now().toString();
      await programarNotificacion(
        notifId,
        nombre,
        medicamento,
        hora,
        frecuencia
      );
      await agregarMedicamento(
        id,
        medicamento,
        dosis,
        hora,
        frecuencia,
        vencimiento
      );
    }

    limpiarFormulario();
    setModalVisible(false);
  };

  const handleEditar = (item) => {
    setMedicamento(item.medicamento);
    setDosis(item.dosis);
    setHora(item.hora);
    setFrecuencia(item.frecuencia || "diaria");
    setVencimiento(item.vencimiento || "");
    setEditandoId(item.id);
    setModalVisible(true);
  };

  const handleEliminar = (itemId) => {
    Alert.alert(
      "Eliminar medicamento",
      "¿Estás seguro que querés eliminarlo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await cancelarNotificacion(itemId);
            await eliminarMedicamento(id, itemId);
          },
        },
      ]
    );
  };

  const compartirMedicamentos = async () => {
    if (medicamentos.length === 0) {
      Alert.alert("Sin medicamentos", "No hay medicamentos para compartir");
      return;
    }
    const texto = medicamentos
      .map(
        (m) =>
          `💊 ${m.medicamento}\n   Dosis: ${m.dosis}\n   Hora: ⏰ ${
            m.hora
          }\n   Frecuencia: 🔄 ${m.frecuencia || "diaria"}`
      )
      .join("\n\n");
    await Share.share({ message: `🐾 Medicamentos de ${nombre}:\n\n${texto}` });
  };

  return (
    <View style={[styles.container, { backgroundColor: t.fondo }]}>
      <Text style={[styles.titulo, { color: t.texto }]}>💊 {nombre}</Text>
      <Text style={[styles.subtitulo, { color: t.textoSecundario }]}>
        {medicamentos.length}{" "}
        {medicamentos.length === 1 ? "medicamento" : "medicamentos"}
      </Text>

      <View style={styles.botonesRow}>
        <TouchableOpacity
          style={[styles.btnAccion, { backgroundColor: "#e94560" }]}
          onPress={() =>
            router.push({ pathname: "/vacunas", params: { id, nombre } })
          }
        >
          <Text style={styles.btnAccionTexto}>💉 Vacunas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAccion, { backgroundColor: "#3498db" }]}
          onPress={() =>
            router.push({ pathname: "/bano", params: { id, nombre } })
          }
        >
          <Text style={styles.btnAccionTexto}>🛁 Baños</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAccion, { backgroundColor: "#25D366" }]}
          onPress={compartirMedicamentos}
        >
          <Text style={styles.btnAccionTexto}>📤 Compartir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={medicamentos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.vacio, { color: t.textoSecundario }]}>
            No hay medicamentos todavía.{"\n"}Tocá el + para agregar uno.
          </Text>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.tarjeta,
              {
                backgroundColor:
                  tema === "colorful"
                    ? t.avatares[index % t.avatares.length]
                    : t.fondoTarjeta,
                borderColor: t.borde,
              },
            ]}
          >
            <View style={styles.tarjetaInfo}>
              <Text
                style={[
                  styles.nombre,
                  { color: tema === "colorful" ? "#fff" : t.texto },
                ]}
              >
                {item.medicamento}
              </Text>
              <Text
                style={[
                  styles.dosis,
                  {
                    color:
                      tema === "colorful"
                        ? "rgba(255,255,255,0.7)"
                        : t.textoSecundario,
                  },
                ]}
              >
                💊 {item.dosis}
              </Text>
              <Text
                style={[
                  styles.hora,
                  {
                    color:
                      tema === "colorful" ? "rgba(255,255,255,0.9)" : t.boton,
                  },
                ]}
              >
                ⏰ {item.hora}
              </Text>
              <Text
                style={[
                  styles.frecuencia,
                  {
                    color:
                      tema === "colorful"
                        ? "rgba(255,255,255,0.7)"
                        : t.textoSecundario,
                  },
                ]}
              >
                🔄 {item.frecuencia || "diaria"}
              </Text>
              {item.vencimiento ? (
                <Text
                  style={[
                    styles.frecuencia,
                    {
                      color:
                        tema === "colorful"
                          ? "rgba(255,255,255,0.7)"
                          : t.textoSecundario,
                    },
                  ]}
                >
                  📅 Vence: {item.vencimiento}
                </Text>
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
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: t.boton }]}
        onPress={() => {
          limpiarFormulario();
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabTexto}>💊 Agregar</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          limpiarFormulario();
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContenido, { backgroundColor: t.fondoTarjeta }]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitulo, { color: t.texto }]}>
              {editandoId ? "✏️ Editar medicamento" : "+ Nuevo medicamento"}
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
              placeholder="Nombre del medicamento"
              placeholderTextColor={t.textoSecundario}
              value={medicamento}
              onChangeText={setMedicamento}
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
              placeholder="Dosis (ej: 1 pastilla)"
              placeholderTextColor={t.textoSecundario}
              value={dosis}
              onChangeText={setDosis}
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
              placeholder="Hora (ej: 08:00)"
              placeholderTextColor={t.textoSecundario}
              value={hora}
              onChangeText={setHora}
            />

            <View
              style={[
                styles.pickerContainer,
                { backgroundColor: t.fondoInput, borderColor: t.borde },
              ]}
            >
              <Picker
                selectedValue={frecuencia}
                onValueChange={(value) => setFrecuencia(value)}
                style={{ color: t.texto }}
                dropdownIconColor={t.texto}
              >
                <Picker.Item label="Una vez al día" value="diaria" />
                <Picker.Item label="Cada 8 horas" value="cada 8hs" />
                <Picker.Item label="Cada 12 horas" value="cada 12hs" />
                <Picker.Item label="Cada 24 horas" value="cada 24hs" />
                <Picker.Item
                  label="Cada 48 horas (día por medio)"
                  value="cada 48hs"
                />
                <Picker.Item
                  label="Cada 72 horas (cada 3 días)"
                  value="cada 72hs"
                />
                <Picker.Item
                  label="Dos veces por semana"
                  value="2 veces/semana"
                />
                <Picker.Item label="Una vez por semana" value="semanal" />
                <Picker.Item label="Cada 15 días" value="cada 15 días" />
                <Picker.Item label="Una vez al mes" value="mensual" />
                <Picker.Item label="Según necesidad" value="según necesidad" />
              </Picker>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: t.fondoInput,
                  borderColor: t.borde,
                  color: t.texto,
                },
              ]}
              placeholder="Vencimiento (ej: 31/12/2026) - opcional"
              placeholderTextColor={t.textoSecundario}
              value={vencimiento}
              onChangeText={setVencimiento}
            />

            <TouchableOpacity
              style={[styles.boton, { backgroundColor: t.boton }]}
              onPress={agregarOEditar}
            >
              <Text style={[styles.botonTexto, { color: t.botonTexto }]}>
                {editandoId ? "✏️ Guardar Cambios" : "+ Agregar Medicamento"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonCancelar, { borderColor: t.borde }]}
              onPress={() => {
                limpiarFormulario();
                setModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.botonCancelarTexto,
                  { color: t.textoSecundario },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 16,
  },
  botonesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  btnAccion: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnAccionTexto: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  tarjeta: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
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
  dosis: {
    fontSize: 13,
    marginTop: 4,
  },
  hora: {
    fontSize: 13,
    marginTop: 4,
  },
  frecuencia: {
    fontSize: 13,
    marginTop: 4,
  },
  btnIcon: {
    fontSize: 18,
  },
  vacio: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
    lineHeight: 24,
  },
  fab: {
    position: "absolute",
    bottom: 50,
    right: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  fabTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContenido: {
    borderRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  boton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonCancelar: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  botonCancelarTexto: {
    fontSize: 15,
  },
});
