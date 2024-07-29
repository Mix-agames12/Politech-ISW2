import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const generateMovementsPDF = async (user, selectedAccount, movements) => {
  try {
    const existingPdfBytes = await fetch('/assets/pdfs/comprobante.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const textColor = rgb(0, 0, 0);
    const pages = pdfDoc.getPages();
    let page = pages[0];
    let yPosition = 700;

    // Fecha de impresión en la esquina superior derecha
    const currentDate = new Date().toLocaleDateString();
    page.drawText(`Fecha: ${currentDate}`, {
      x: page.getWidth() - 100,
      y: 730,
      size: 12,
      font,
      color: textColor,
    });

    // Centrar el título "Reporte de Movimientos"
    const title = 'Reporte de Movimientos';
    const titleWidth = fontBold.widthOfTextAtSize(title, 14);
    const titleX = (page.getWidth() - titleWidth) / 2;

    page.drawText(title, {
      x: titleX,
      y: 700,
      size: 14,
      font: fontBold,
      color: textColor,
    });

    // Información de la cuenta
    page.drawText(`Cuenta: ${selectedAccount.accountNumber} - ${selectedAccount.tipoCuenta}`, {
      x: 70,
      y: 670,
      size: 12,
      font,
      color: textColor,
    });

    // Salto de línea
    yPosition -= 30;

    // Detalle en negrita
    page.drawText('Detalle de Movimientos', {
      x: 70,
      y: yPosition,
      size: 12,
      fontBold,
      color: textColor,
    });

    // Encabezados de tabla
    yPosition -= 20;
    page.drawText('Fecha', {
      x: 70,
      y: yPosition,
      size: 12,
      fontBold,
      color: textColor,
    });
    page.drawText('Descripción', {
      x: 130,
      y: yPosition,
      size: 12,
      fontBold,
      color: textColor,
    });
    page.drawText('Monto', {
      x: 320,
      y: yPosition,
      size: 12,
      fontBold,
      color: textColor,
    });
    page.drawText('Saldo', {
      x: 400,
      y: yPosition,
      size: 12,
      fontBold,
      color: textColor,
    });

    // Detalles de los movimientos
    yPosition -= 20;
    const lineHeight = 15; // Espacio entre líneas
    for (const movement of movements) {
      if (yPosition < 50) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 800;
      }

      const movementDate = new Date(movement.fecha).toLocaleDateString();
      const description = movement.tipoMovimiento === 'debito'
        ? `Transferencia a ${movement.nombreDestino || 'Desconocido'}`
        : `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`;
      const amount = movement.tipoMovimiento === 'credito'
        ? `+${movement.monto.toFixed(2)}`
        : `-${movement.monto.toFixed(2)}`;
      const balance = movement.saldoActualizado !== undefined
        ? `$${movement.saldoActualizado.toFixed(2)}`
        : 'N/A';

      page.drawText(movementDate, {
        x: 70,
        y: yPosition,
        size: 12,
        font,
        color: textColor,
      });
      page.drawText(description, {
        x: 130,
        y: yPosition,
        size: 12,
        font,
        color: textColor,
      });
      page.drawText(amount, {
        x: 320,
        y: yPosition,
        size: 12,
        font,
        color: textColor,
      });
      page.drawText(balance, {
        x: 400,
        y: yPosition,
        size: 12,
        font,
        color: textColor,
      });

      yPosition -= lineHeight;
    }

    // Agradecimiento
    if (yPosition < 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 800;
    }

    page.drawText('Gracias por utilizar nuestros servicios.', {
      x: 70,
      y: yPosition - 20,
      size: 12,
      font,
      color: textColor,
    });
    page.drawText('Atentamente,', {
      x: 70,
      y: yPosition - 40,
      size: 12,
      font,
      color: textColor,
    });
    page.drawText('Banco Politech', {
      x: 70,
      y: yPosition - 60,
      size: 12,
      fontBold,
      color: textColor,
    });

    // Guarda el PDF modificado
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'reporte_movimientos.pdf');
  } catch (error) {
    console.error('Error generando el PDF de movimientos:', error);
  }
};
