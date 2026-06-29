import AsyncStorage from '@react-native-async-storage/async-storage';

const MASCOTAS_KEY = 'mascotas';

export const guardarMascotas = async (mascotas) => {
  try {
    await AsyncStorage.setItem(MASCOTAS_KEY, JSON.stringify(mascotas));
  } catch (error) {
    console.error('Error guardando mascotas:', error);
  }
};

export const cargarMascotas = async () => {
  try {
    const data = await AsyncStorage.getItem(MASCOTAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error cargando mascotas:', error);
    return [];
  }
};

export const guardarMedicamentos = async (mascotaId, medicamentos) => {
  try {
    await AsyncStorage.setItem(`medicamentos_${mascotaId}`, JSON.stringify(medicamentos));
  } catch (error) {
    console.error('Error guardando medicamentos:', error);
  }
};

export const cargarMedicamentos = async (mascotaId) => {
  try {
    const data = await AsyncStorage.getItem(`medicamentos_${mascotaId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error cargando medicamentos:', error);
    return [];
  }
};
export const guardarVacunas = async (mascotaId, vacunas) => {
  try {
    await AsyncStorage.setItem(`vacunas_${mascotaId}`, JSON.stringify(vacunas));
  } catch (error) {
    console.error('Error guardando vacunas:', error);
  }
};

export const cargarVacunas = async (mascotaId) => {
  try {
    const data = await AsyncStorage.getItem(`vacunas_${mascotaId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error cargando vacunas:', error);
    return [];
  }
};