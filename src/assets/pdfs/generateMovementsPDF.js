import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

const splitTextIntoLines = (text, maxWidth, font, fontSize) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const width = font.widthOfTextAtSize(currentLine + word, fontSize);
    if (width < maxWidth) {
      currentLine += word + ' ';
    } else {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
};

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
    const marginLeft = 50;
    const cellPadding = 5;
    const tableWidth = 500;
    const fontSize = 10;
    const maxTextWidth = 80; // Ancho máximo para el texto en la celda

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
    yPosition = 670;
    page.drawText(`Cuenta: ${selectedAccount.accountNumber} - ${selectedAccount.tipoCuenta}`, {
      x: marginLeft,
      y: yPosition,
      size: 12,
      font,
      color: textColor,
    });

    // Salto de línea
    yPosition -= 30;

    // Agrupación por fecha
    const groupedMovements = movements.reduce((acc, movement) => {
      const dateStr = new Date(movement.fecha).toLocaleDateString();
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(movement);
      return acc;
    }, {});

    // Encabezados de tabla
    const headers = ['Descripción', 'Cuenta Origen', 'Cuenta Destino', 'Tipo', 'Monto', 'Saldo'];
    const colWidths = [150, 80, 80, 50, 50, 50]; // Ajuste del ancho de las columnas
    const lineHeight = 15;

    // Renderizado de movimientos agrupados por fecha
    Object.entries(groupedMovements).forEach(([date, movements], groupIndex) => {
      if (yPosition < 70) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 800;
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
          size: fontSize,
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
          yPosition = 800;
        }

        const description = movement.tipoMovimiento === 'debito'
          ? `Transferencia a ${movement.nombreDestino || 'Desconocido'}`
          : `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`;
        const tipo = movement.tipoMovimiento === 'credito' ? 'Crédito' : 'Débito';
        const amount = movement.monto !== undefined ? movement.monto.toFixed(2) : 'N/A';
        const balance = movement.saldoActualizado !== undefined ? `$${movement.saldoActualizado.toFixed(2)}` : 'N/A';

        const rowData = [description, movement.cuentaOrigen, movement.cuentaDestino, tipo, amount, balance];
        xPosition = marginLeft;

        const maxLines = rowData.reduce((max, data, i) => {
          const lines = splitTextIntoLines(data, colWidths[i] - cellPadding * 2, font, fontSize);
          return Math.max(max, lines.length);
        }, 1);

        for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
          xPosition = marginLeft;
          rowData.forEach((data, i) => {
            const textLines = splitTextIntoLines(data, colWidths[i] - cellPadding * 2, font, fontSize);
            const line = textLines[lineIndex] || '';
            page.drawText(line, {
              x: xPosition + cellPadding,
              y: yPosition,
              size: fontSize,
              font,
              color: textColor,
            });
            xPosition += colWidths[i];
          });

          yPosition -= lineHeight;
        }

        // Línea horizontal debajo de cada fila de movimientos
        page.drawLine({
          start: { x: marginLeft, y: yPosition + 2 },
          end: { x: marginLeft + colWidths.reduce((a, b) => a + b), y: yPosition + 2 },
          thickness: 0.5,
          color: textColor,
        });

        yPosition -= 2; // Espacio adicional para la línea
      });

      yPosition -= 20; // Espacio adicional entre fechas diferentes
    });

    // Agradecimiento
    if (yPosition < 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 800;
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
