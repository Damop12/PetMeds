import * as Notifications from 'expo-notifications';

export const pedirPermisos = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const programarNotificacion = async (id, nombreMascota, medicamento, hora) => {
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
};

export const cancelarNotificacion = async (id) => {
  await Notifications.cancelScheduledNotificationAsync(id);
};