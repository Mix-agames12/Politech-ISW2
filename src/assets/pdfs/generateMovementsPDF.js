import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

// Función para calcular el tamaño de fuente adecuado
const calculateFontSize = (text, maxWidth, font, initialFontSize) => {
  let fontSize = initialFontSize;
  while (font.widthOfTextAtSize(text, fontSize) > maxWidth && fontSize > 5) {
    fontSize -= 0.5;
  }
  return fontSize;
};

// Función para dibujar el encabezado en una página
const drawHeader = (page, font, fontBold, user, selectedAccount) => {
  const textColor = rgb(0, 0, 0);

  // Fecha de impresión en la esquina superior derecha
  const currentDate = new Date().toLocaleDateString();
  page.drawText(`Fecha: ${currentDate}`, {
    x: page.getWidth() - 150,
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
    x: 50,
    y: 670,
    size: 12,
    font,
    color: textColor,
  });

  return 640; // Devolver la posición Y para empezar el contenido
};

export const generateMovementsPDF = async (user, selectedAccount, movements) => {
  try {
    const existingPdfBytes = await fetch('/assets/pdfs/comprobante.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const textColor = rgb(0, 0, 0);

    let page = pdfDoc.getPages()[0];
    let yPosition = drawHeader(page, font, fontBold, user, selectedAccount); // Dibujar encabezado en la primera página
    const marginLeft = 50;
    const cellPadding = 5;
    const initialFontSize = 10;
    const lineHeight = 15;

    // Agrupación por fecha
    const groupedMovements = movements.reduce((acc, movement) => {
      const dateStr = new Date(movement.fecha).toLocaleDateString();
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(movement);
      return acc;
    }, {});

    // Encabezados de tabla
    const headers = ['Descripción', 'Cuenta Origen', 'Cuenta Destino', 'Tipo', 'Monto', 'Saldo'];
    const colWidths = [200, 70, 80, 50, 50, 50]; // Ajuste del ancho de las columnas

    // Renderizado de movimientos agrupados por fecha
    Object.entries(groupedMovements).forEach(([date, movements], groupIndex) => {
      if (yPosition < 70) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 800; // Iniciar en una posición adecuada para el nuevo contenido
      }

      // Fecha
      page.drawText(date, {
        x: marginLeft,
        y: yPosition,
        size: 12,
        fontBold,
        color: textColor,
      });
      yPosition -= 20;

      // Encabezados de la tabla
      let xPosition = marginLeft;
      headers.forEach((header, i) => {
        page.drawText(header, {
          x: xPosition + cellPadding,
          y: yPosition,
          size: initialFontSize,
          fontBold,
          color: textColor,
        });
        xPosition += colWidths[i];
      });

      // Línea horizontal debajo de los encabezados
      page.drawLine({
        start: { x: marginLeft, y: yPosition - 2 },
        end: { x: marginLeft + colWidths.reduce((a, b) => a + b), y: yPosition - 2 },
        thickness: 1,
        color: textColor,
      });

      yPosition -= lineHeight;

      // Filas de movimientos
      movements.forEach((movement) => {
        if (yPosition < 50) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = 800; // Iniciar en una posición adecuada para el nuevo contenido
        }

        const description = movement.tipo === 'transferencia' ? (
          movement.tipoMovimiento === 'debito' ?
            `Transferencia a ${movement.nombreDestino || 'Desconocido'}` :
            `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`
          ) : (
            `Pago de ${movement.cuentaDestino.toLowerCase() || 'Desconocido'}`
        );
        const destino = /^\D+$/.test(movement.cuentaDestino) ?
          `` :
          `******${movement.cuentaDestino.slice(-4)}`;
        const tipo = movement.tipoMovimiento === 'credito' ? 'Crédito' : 'Débito';
        const amount = movement.monto !== undefined ? movement.monto.toFixed(2) : 'N/A';
        const balance = movement.saldoActualizado !== undefined ? `$${movement.saldoActualizado.toFixed(2)}` : 'N/A';

        const rowData = [description, movement.cuentaOrigen, destino, tipo, amount, balance];
        xPosition = marginLeft;

        rowData.forEach((data, i) => {
          const adjustedFontSize = calculateFontSize(data, colWidths[i] - cellPadding * 2, font, initialFontSize);
          page.drawText(data, {
            x: xPosition + cellPadding,
            y: yPosition,
            size: adjustedFontSize,
            font,
            color: textColor,
          });
          xPosition += colWidths[i];
        });

        // Línea horizontal debajo de cada fila de movimientos
        page.drawLine({
          start: { x: marginLeft, y: yPosition - 2 },
          end: { x: marginLeft + colWidths.reduce((a, b) => a + b), y: yPosition - 2 },
          thickness: 0.5,
          color: textColor,
        });

        yPosition -= lineHeight;
      });

      yPosition -= 20; // Espacio adicional entre fechas diferentes
    });

    // Agradecimiento
    if (yPosition < 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 800; // Iniciar en una posición adecuada para el nuevo contenido
    }

    page.drawText('Gracias por utilizar nuestros servicios.', {
      x: marginLeft,
      y: yPosition - 20,
      size: 12,
      font,
      color: textColor,
    });
    page.drawText('Atentamente,', {
      x: marginLeft,
      y: yPosition - 40,
      size: 12,
      font,
      color: textColor,
    });
    page.drawText('Banco Politech', {
      x: marginLeft,
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
