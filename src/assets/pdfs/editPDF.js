import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const generatePDF = async (transactionData) => {
  try {
    const existingPdfBytes = await fetch('/assets/pdfs/comprobante.pdf').then(res => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const textColor = rgb(0, 0, 0);

    // Fecha de impresión en la esquina superior derecha
    firstPage.drawText(`Fecha: ${transactionData.date}`, {
      x: 450,
      y: 730,
      size: 12,
      font,
      color: textColor,
    });

    // Centrar el texto "TRANSFERENCIA DIRECTA"
    const title = 'TRANSFERENCIA DIRECTA';
    const titleWidth = fontBold.widthOfTextAtSize(title, 14);
    const pageWidth = firstPage.getWidth();
    const titleX = (pageWidth - titleWidth) / 2;

    firstPage.drawText(title, {
      x: titleX,
      y: 700,
      size: 14,
      font: fontBold,
      color: textColor,
    });

    // Estado de la transacción
    firstPage.drawText('La transacción se realizó con éxito.', {
      x: 70,
      y: 670,
      size: 12,
      font,
      color: textColor,
    });

    // Salto de línea
    firstPage.drawText('\n', {
      x: 70,
      y: 655,
      size: 12,
      font,
      color: textColor,
    });

    // Detalle en negrita
    firstPage.drawText('Detalle', {
      x: 70,
      y: 640, // Ajustado para el salto de línea
      size: 12,
      font: fontBold, // Asegura que este texto esté en negrita
      color: textColor,
    });

    // Detalles de la transacción con números de cuenta completos y nombres
    const description = transactionData.description || 'N/A';
    const senderName = transactionData.senderName || 'N/A';
    const receiverName = transactionData.receiverName || 'N/A';

    firstPage.drawText(`Valor: $${transactionData.amount}`, {
      x: 70,
      y: 620,
      size: 12,
      font,
      color: textColor,
    });
    firstPage.drawText(`Desde: ${transactionData.senderAccount}`, {
      x: 70,
      y: 600,
      size: 12,
      font,
      color: textColor,
    });
    firstPage.drawText(`Nombre del remitente: ${senderName}`, {
      x: 70,
      y: 580,
      size: 12,
      font,
      color: textColor,
    });
    firstPage.drawText(`Descripción: ${description}`, {
      x: 70,
      y: 560,
      size: 12,
      font,
      color: textColor,
    });
    firstPage.drawText(`Cuenta Beneficiaria: ${transactionData.receiverAccount}`, {
      x: 70,
      y: 540,
      size: 12,
      font,
      color: textColor,
    });

    // Salto de línea antes de "Nombre Beneficiario"
    firstPage.drawText(`Nombre Beneficiario: ${receiverName}`, {
      x: 70,
      y: 520,
      size: 12,
      font,
      color: textColor,
    });

    // Otro salto de línea antes del agradecimiento
    firstPage.drawText('\n', {
      x: 70,
      y: 505,
      size: 12,
      font,
      color: textColor,
    });

    // Agradecimiento
    firstPage.drawText('Gracias por utilizar nuestros servicios.', {
      x: 70,
      y: 490,
      size: 12,
      font,
      color: textColor,
    });
    firstPage.drawText('Atentamente,', {
      x: 70,
      y: 470,
      size: 12,
      font,
      color: textColor,
    });
    firstPage.drawText('Banco Politech', {
      x: 70,
      y: 450,
      size: 12,
      fontBold,
      color: textColor,
    });

    // Guarda el PDF modificado
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'comprobante.pdf');
  } catch (error) {
    console.error('Error generando el PDF:', error);
  }
};
