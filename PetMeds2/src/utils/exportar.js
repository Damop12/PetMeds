import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const generarHTMLFicha = (mascota, medicamentos, vacunas, banos) => {
  const medicamentosHTML = medicamentos.length === 0
    ? '<p style="color:#888;">No hay medicamentos registrados</p>'
    : medicamentos.map((m) => `
        <div class="item">
          <div class="item-nombre">💊 ${m.medicamento}</div>
          <div class="item-detalle">Dosis: ${m.dosis}</div>
          <div class="item-detalle">Hora: ${m.hora}</div>
          <div class="item-detalle">Frecuencia: ${m.frecuencia || 'diaria'}</div>
          ${m.vencimiento ? `<div class="item-detalle">Vence: ${m.vencimiento}</div>` : ''}
        </div>
      `).join('');

  const vacunasHTML = vacunas.length === 0
    ? '<p style="color:#888;">No hay vacunas registradas</p>'
    : vacunas.map((v) => `
        <div class="item">
          <div class="item-nombre">💉 ${v.vacuna}</div>
          <div class="item-detalle">Aplicada: ${v.fecha}</div>
          ${v.proxima ? `<div class="item-detalle">Próxima: ${v.proxima}</div>` : ''}
        </div>
      `).join('');

  const banosHTML = banos.length === 0
    ? '<p style="color:#888;">No hay registros de baño</p>'
    : banos.map((b) => `
        <div class="item">
          <div class="item-nombre">🛁 ${b.tipo}</div>
          <div class="item-detalle">Fecha: ${b.fecha}</div>
          ${b.proximo ? `<div class="item-detalle">Próximo: ${b.proximo}</div>` : ''}
          ${b.notas ? `<div class="item-detalle">Notas: ${b.notas}</div>` : ''}
        </div>
      `).join('');

  const fecha = new Date().toLocaleDateString('es-AR');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        .header { background: #6c63ff; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 4px 0 0; font-size: 14px; opacity: 0.8; }
        .seccion { margin-bottom: 20px; }
        .seccion h2 { color: #6c63ff; font-size: 16px; border-bottom: 2px solid #eeedfe; padding-bottom: 6px; }
        .item { background: #f8f8f8; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
        .item-nombre { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
        .item-detalle { font-size: 12px; color: #666; margin-top: 2px; }
        .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🐾 ${mascota.nombre}</h1>
        <p>${mascota.tipo} · Ficha generada el ${fecha}</p>
      </div>

      <div class="seccion">
        <h2>💊 Medicamentos</h2>
        ${medicamentosHTML}
      </div>

      <div class="seccion">
        <h2>💉 Vacunas</h2>
        ${vacunasHTML}
      </div>

      <div class="seccion">
        <h2>🛁 Baños y Grooming</h2>
        ${banosHTML}
      </div>

      <div class="footer">PetMeds — Ficha médica digital</div>
    </body>
    </html>
  `;
};

export const exportarPDF = async (mascota, medicamentos, vacunas, banos) => {
    try {
      const html = generarHTMLFicha(mascota, medicamentos, vacunas, banos);
      const fileUri = FileSystem.documentDirectory + `ficha_${mascota.nombre}.html`;
      await FileSystem.writeAsStringAsync(fileUri, html);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: `Ficha de ${mascota.nombre}`,
      });
    } catch (error) {
      console.error('Error exportando:', error);
    }
  };

  export const exportarExcel = async (mascota, medicamentos, vacunas, banos) => {
    try {
      const fecha = new Date().toLocaleDateString('es-AR');
      let csv = `Ficha de ${mascota.nombre} (${mascota.tipo}) - ${fecha}\n\n`;
  
      csv += `MEDICAMENTOS\n`;
      csv += `Nombre,Dosis,Hora,Frecuencia,Vencimiento\n`;
      if (medicamentos.length === 0) {
        csv += `Sin medicamentos\n`;
      } else {
        medicamentos.forEach((m) => {
          csv += `${m.medicamento},${m.dosis},${m.hora},${m.frecuencia || 'diaria'},${m.vencimiento || '-'}\n`;
        });
      }
  
      csv += `\nVACUNAS\n`;
      csv += `Vacuna,Fecha aplicación,Próxima dosis\n`;
      if (vacunas.length === 0) {
        csv += `Sin vacunas\n`;
      } else {
        vacunas.forEach((v) => {
          csv += `${v.vacuna},${v.fecha},${v.proxima || '-'}\n`;
        });
      }
  
      csv += `\nBAÑOS Y GROOMING\n`;
      csv += `Tipo,Fecha,Próximo,Notas\n`;
      if (banos.length === 0) {
        csv += `Sin registros\n`;
      } else {
        banos.forEach((b) => {
          csv += `${b.tipo},${b.fecha},${b.proximo || '-'},${b.notas || '-'}\n`;
        });
      }
  
      const fileUri = FileSystem.documentDirectory + `ficha_${mascota.nombre}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Ficha de ${mascota.nombre}`,
      });
    } catch (error) {
      console.error('Error exportando Excel:', error);
    }
  };