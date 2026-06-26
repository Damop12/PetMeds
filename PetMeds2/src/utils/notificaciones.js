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

export const programarNotificacion = async (id, nombreMascota, medicamento, hora) => {
  try {
    const [horas, minutos] = hora.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: `💊 Hora del medicamento de ${nombreMascota}`,
        body: `Es hora de darle ${medicamento}`,
        sound: true,
      },
      trigger: {
        type: 'daily',
        hour: horas,
        minute: minutos,
      },
    });
  } catch (error) {
    console.log('No se pudo programar la notificación:', error);
  }
};

export const cancelarNotificacion = async (id) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.log('No se pudo cancelar la notificación:', error);
  }
};