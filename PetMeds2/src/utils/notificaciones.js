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

const programarSemanal = async (id, nombreMascota, medicamento, horas, minutos) => {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `💊 Medicamento de ${nombreMascota}`,
      body: `Es hora de darle ${medicamento}`,
      sound: true,
    },
    trigger: {
      type: 'weekly',
      weekday: new Date().getDay() + 1,
      hour: horas,
      minute: minutos,
    },
  });
};

export const programarNotificacion = async (id, nombreMascota, medicamento, hora, frecuencia = 'diaria') => {
  try {
    const [horas, minutos] = hora.split(':').map(Number);
    await cancelarNotificacion(id);

    switch (frecuencia) {
      case 'cada 8hs':
        await programarUna(`${id}_1`, nombreMascota, medicamento, horas, minutos);
        await programarUna(`${id}_2`, nombreMascota, medicamento, (horas + 8) % 24, minutos);
        await programarUna(`${id}_3`, nombreMascota, medicamento, (horas + 16) % 24, minutos);
        break;

      case 'cada 12hs':
        await programarUna(`${id}_1`, nombreMascota, medicamento, horas, minutos);
        await programarUna(`${id}_2`, nombreMascota, medicamento, (horas + 12) % 24, minutos);
        break;

      case 'cada 24hs':
      case 'diaria':
        await programarUna(id, nombreMascota, medicamento, horas, minutos);
        break;

      case 'cada 48hs':
        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: `💊 Medicamento de ${nombreMascota}`,
            body: `Es hora de darle ${medicamento}`,
            sound: true,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 48 * 60 * 60,
            repeats: true,
          },
        });
        break;

      case 'cada 72hs':
        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: `💊 Medicamento de ${nombreMascota}`,
            body: `Es hora de darle ${medicamento}`,
            sound: true,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 72 * 60 * 60,
            repeats: true,
          },
        });
        break;

      case 'semanal':
        await programarSemanal(id, nombreMascota, medicamento, horas, minutos);
        break;

      case '2 veces/semana':
        await programarSemanal(`${id}_1`, nombreMascota, medicamento, horas, minutos);
        const diaSemana2 = (new Date().getDay() + 3) % 7 + 1;
        await Notifications.scheduleNotificationAsync({
          identifier: `${id}_2`,
          content: {
            title: `💊 Medicamento de ${nombreMascota}`,
            body: `Es hora de darle ${medicamento}`,
            sound: true,
          },
          trigger: {
            type: 'weekly',
            weekday: diaSemana2,
            hour: horas,
            minute: minutos,
          },
        });
        break;

      case 'cada 15 días':
        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: `💊 Medicamento de ${nombreMascota}`,
            body: `Es hora de darle ${medicamento}`,
            sound: true,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 15 * 24 * 60 * 60,
            repeats: true,
          },
        });
        break;

      case 'mensual':
        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: `💊 Medicamento de ${nombreMascota}`,
            body: `Es hora de darle ${medicamento}`,
            sound: true,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 30 * 24 * 60 * 60,
            repeats: true,
          },
        });
        break;

      case 'según necesidad':
        break;

      default:
        await programarUna(id, nombreMascota, medicamento, horas, minutos);
        break;
    }
  } catch (error) {
    console.log('No se pudo programar la notificación:', error);
  }
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