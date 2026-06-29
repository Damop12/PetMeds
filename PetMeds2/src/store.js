import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { guardarMascotas, cargarMascotas, guardarMedicamentos, cargarMedicamentos } from './utils/storage';

const useStore = create((set, get) => ({
    // --- TEMA ---
tema: 'minimal',

setTema: async (nuevoTema) => {
  set({ tema: nuevoTema });
  await AsyncStorage.setItem('tema', nuevoTema);
},

cargarTema: async () => {
  const tema = await AsyncStorage.getItem('tema');
  if (tema) set({ tema });
},
  // --- MASCOTAS ---
  mascotas: [],

  cargarMascotas: async () => {
    const data = await cargarMascotas();
    set({ mascotas: data });
  },

  agregarMascota: async (nombre, tipo) => {
    const nueva = {
      id: Date.now().toString(),
      nombre,
      tipo,
    };
    const nuevaLista = [...get().mascotas, nueva];
    set({ mascotas: nuevaLista });
    await guardarMascotas(nuevaLista);
  },

  editarMascota: async (id, nombre, tipo) => {
    const actualizada = get().mascotas.map((m) =>
      m.id === id ? { ...m, nombre, tipo } : m
    );
    set({ mascotas: actualizada });
    await guardarMascotas(actualizada);
  },

  eliminarMascota: async (id) => {
    const nueva = get().mascotas.filter((m) => m.id !== id);
    set({ mascotas: nueva });
    await guardarMascotas(nueva);
  },

  // --- FOTO ---
actualizarFotoMascota: async (id, foto) => {
  const actualizada = get().mascotas.map((m) =>
    m.id === id ? { ...m, foto } : m
  );
  set({ mascotas: actualizada });
  await guardarMascotas(actualizada);
},
  // --- MEDICAMENTOS ---
  medicamentos: {},

  cargarMedicamentos: async (mascotaId) => {
    const data = await cargarMedicamentos(mascotaId);
    set((state) => ({
      medicamentos: { ...state.medicamentos, [mascotaId]: data },
    }));
  },

  agregarMedicamento: async (mascotaId, medicamento, dosis, hora, frecuencia, vencimiento) => {
    const nuevo = {
      id: Date.now().toString(),
      medicamento,
      dosis,
      hora,
      frecuencia,
      vencimiento,
    };
    const lista = get().medicamentos[mascotaId] || [];
    const nuevaLista = [...lista, nuevo];
    set((state) => ({
      medicamentos: { ...state.medicamentos, [mascotaId]: nuevaLista },
    }));
    await guardarMedicamentos(mascotaId, nuevaLista);
  },

  editarMedicamento: async (mascotaId, id, medicamento, dosis, hora, frecuencia, vencimiento) => {
    const lista = get().medicamentos[mascotaId] || [];
    const actualizada = lista.map((m) =>
      m.id === id ? { ...m, medicamento, dosis, hora, frecuencia, vencimiento } : m
    );
    set((state) => ({
      medicamentos: { ...state.medicamentos, [mascotaId]: actualizada },
    }));
    await guardarMedicamentos(mascotaId, actualizada);
  },

  eliminarMedicamento: async (mascotaId, id) => {
    const lista = get().medicamentos[mascotaId] || [];
    const nueva = lista.filter((m) => m.id !== id);
    set((state) => ({
      medicamentos: { ...state.medicamentos, [mascotaId]: nueva },
    }));
    await guardarMedicamentos(mascotaId, nueva);
  },
}));

export default useStore;