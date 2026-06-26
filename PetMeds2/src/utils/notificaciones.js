import * as Notifications from 'expo-notifications';

export const pedirPermisos = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Notificaciones no disponibles en Expo Go');
    return false;
  }
};

export const programarNotificacion = async (id, nombreMascota, medicamento, hora, frecuencia = 'diaria') => {
  try {
    const [horas, minutos] = hora.split(':').map(Number);

    await cancelarNotificacion(id);

    if (frecuencia === 'cada 8hs') {
      const horas2 = (horas + 8) % 24;
      const horas3 = (horas + 16) % 24;
      await programarUna(`${id}_1`, nombreMascota, medicamento, horas, minutos);
      await programarUna(`${id}_2`, nombreMascota, medicamento, horas2, minutos);
      await programarUna(`${id}_3`, nombreMascota, medicamento, horas3, minutos);
    } else if (frecuencia === 'cada 12hs') {
      const horas2 = (horas + 12) % 24;
      await programarUna(`${id}_1`, nombreMascota, medicamento, horas, minutos);
      await programarUna(`${id}_2`, nombreMascota, medicamento, horas2, minutos);
    } else {
      await programarUna(id, nombreMascota, medicamento, horas, minutos);
    }
  } catch (error) {
    console.log('No se pudo programar la notificación:', error);
  }
};

const programarUna = async (id, nombreMascota, medicamento, horas, minutos) => {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `💊 Medicamento de ${nombreMascota}`,
      body: `Es hora de darle ${medicamento}`,
      sound: true,
    },
    trigger: {
      type: 'daily',
      hour: horas,
      minute: minutos,
    },
  });
};

export const cancelarNotificacion = async (id) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    await Notifications.cancelScheduledNotificationAsync(`${id}_1`);
    await Notifications.cancelScheduledNotificationAsync(`${id}_2`);
    await Notifications.cancelScheduledNotificationAsync(`${id}_3`);
  } catch (error) {
    console.log('No se pudo cancelar la notificación:', error);
  }
};