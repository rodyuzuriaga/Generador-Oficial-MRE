import jsPDF from 'jspdf';
import { GeneratedDocumentData, DocumentType } from '../types';
import { MRE_LOGO_URL } from '../constants';

const loadImage = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn("Could not load logo for PDF due to CORS or network error.");
      resolve(null);
    };
  });
};

export const generatePDF = async (data: GeneratedDocumentData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const marginX = 25;
  let cursorY = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (marginX * 2);

  const isResolution = data.documentType === DocumentType.RESOLUCION_MINISTERIAL;
  const isMemo = data.documentType === DocumentType.MEMORANDUM;
  const isInforme = data.documentType === DocumentType.INFORME_TECNICO;

  // --- Logo & Header ---
  const logoData = await loadImage(MRE_LOGO_URL);
  if (logoData) {
      // Adjusted size for horizontal logo (approx 4:1 ratio)
      doc.addImage(logoData, 'PNG', marginX, 12, 50, 12); 
  } else {
      // Fallback text if image fails
      doc.setFontSize(8);
      doc.text("REPÚBLICA DEL PERÚ", marginX, 20);
  }

  // Year Name (Top Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29); // Red-900 (RGB)
  const splitYear = doc.splitTextToSize(`"${data.yearName}"`, 80); // Tighter wrap for cleaner look
  doc.text(splitYear, pageWidth - marginX, 20, { align: 'right' });
  doc.setTextColor(0);

  cursorY = 50; // Start content below header/logo area

  // --- Document Number & Date ---
  
  if (isResolution) {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(data.documentNumber, pageWidth / 2, cursorY, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line((pageWidth/2) - 30, cursorY + 2, (pageWidth/2) + 30, cursorY + 2); // Underline
      cursorY += 15;
      
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(data.cityAndDate, pageWidth - marginX, cursorY, { align: 'right' });
      cursorY += 15;

  } else {
      // Standard / Memo / Informe
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(data.documentNumber, marginX, cursorY);
      cursorY += 10;
      
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(data.cityAndDate, pageWidth - marginX, cursorY, { align: 'right' });
      cursorY += 15;
  }

  // --- Recipient / Meta Data ---

  if (!isResolution) {
      if (isMemo || isInforme) {
          // Table-like structure for Memo/Informe
          doc.setFontSize(11);
          const metaX = marginX;
          const labelWidth = 25;
          const valueX = metaX + labelWidth;

          doc.setFont("times", "bold"); doc.text("A", metaX, cursorY);
          doc.setFont("times", "normal"); doc.text(`: ${data.recipientName} - ${data.recipientTitle}`, valueX, cursorY);
          cursorY += 6;

          doc.setFont("times", "bold"); doc.text("DE", metaX, cursorY);
          doc.setFont("times", "normal"); doc.text(`: ${data.senderName} - ${data.senderTitle}`, valueX, cursorY);
          cursorY += 6;

          doc.setFont("times", "bold"); doc.text("ASUNTO", metaX, cursorY);
          doc.setFont("times", "normal"); 
          const splitSubject = doc.splitTextToSize(`: ${data.subject}`, contentWidth - labelWidth);
          doc.text(splitSubject, valueX, cursorY);
          cursorY += (splitSubject.length * 5) + 2;

          doc.setFont("times", "bold"); doc.text("FECHA", metaX, cursorY);
          doc.setFont("times", "normal"); doc.text(`: ${data.cityAndDate}`, valueX, cursorY);
          cursorY += 6;

          if (data.reference) {
            doc.setFont("times", "bold"); doc.text("REF.", metaX, cursorY);
            doc.setFont("times", "normal"); doc.text(`: ${data.reference}`, valueX, cursorY);
            cursorY += 6;
          }

          doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
          cursorY += 10;

      } else {
          // Standard Letter (Oficio / Carta)
          doc.setFontSize(11);
          doc.setFont("times", "bold");
          doc.text(`Señor(a):`, marginX, cursorY);
          cursorY += 5;
          doc.text(data.recipientName.toUpperCase(), marginX, cursorY);
          cursorY += 5;
          doc.setFont("times", "normal");
          doc.text(data.recipientTitle, marginX, cursorY);
          cursorY += 5;
          doc.text(data.recipientEntity, marginX, cursorY);
          cursorY += 5;
          doc.text(`Presente.-`, marginX, cursorY);
          cursorY += 15;

          // Asunto
          doc.setFont("times", "bold");
          doc.text(`Asunto:`, marginX, cursorY);
          doc.setFont("times", "normal");
          const splitSubject = doc.splitTextToSize(data.subject, contentWidth - 25);
          doc.text(splitSubject, marginX + 25, cursorY);
          cursorY += (splitSubject.length * 5) + 5;

          // Ref
          if (data.reference) {
              doc.setFont("times", "bold");
              doc.text(`Ref.:`, marginX, cursorY);
              doc.setFont("times", "normal");
              const splitRef = doc.splitTextToSize(data.reference, contentWidth - 25);
              doc.text(splitRef, marginX + 25, cursorY);
              cursorY += (splitRef.length * 5) + 5;
          }
          
          doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
          cursorY += 10;
      }
  }

  // --- Body ---
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  
  data.bodyParagraphs.forEach((paragraph) => {
    // Styling for Resolutions
    let indent = 0;
    let isBold = false;
    
    if (isResolution) {
        if (paragraph.startsWith("SE RESUELVE") || paragraph.startsWith("Vistos") || paragraph.startsWith("CONSIDERANDO")) {
             isBold = true;
             cursorY += 4; // Extra space before titles
        } else if (paragraph.startsWith("Artículo")) {
             isBold = true;
             indent = 10;
        } else {
             indent = 10;
        }
    }

    doc.setFont("times", isBold ? "bold" : "normal");

    // Check Page Break
    if (cursorY > pageHeight - 40) {
        doc.addPage();
        cursorY = 30; // Reset
    }

    const splitText = doc.splitTextToSize(paragraph, contentWidth - indent);
    doc.text(splitText, marginX + indent, cursorY, { align: 'justify', maxWidth: contentWidth - indent });
    cursorY += (splitText.length * 5) + 3;
  });

  cursorY += 15;

  // --- Signature Block ---
  if (cursorY > pageHeight - 60) {
      doc.addPage();
      cursorY = 50;
  }

  // Ink Signature Line
  doc.setLineWidth(0.5);
  doc.line((pageWidth / 2) - 30, cursorY, (pageWidth / 2) + 30, cursorY); 
  cursorY += 5;
  
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text(data.senderName.toUpperCase(), pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 4;
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text(data.senderTitle.toUpperCase(), pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 4;
  doc.text(data.senderEntity, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 10;

  // Digital Signature Box (Simulated)
  const boxWidth = 90;
  const boxHeight = 25;
  const boxX = (pageWidth / 2) - (boxWidth / 2);
  
  doc.setDrawColor(150);
  doc.setLineWidth(0.1);
  doc.rect(boxX, cursorY, boxWidth, boxHeight); // Outer box
  
  // QR Placeholder
  doc.setFillColor(240);
  doc.rect(boxX + 2, cursorY + 2, 21, 21, 'F'); 
  doc.setFillColor(0);
  // Random squares for QR
  for(let i=0; i<15; i++) {
      doc.rect(boxX + 4 + (Math.random()*15), cursorY + 4 + (Math.random()*15), 1.5, 1.5, 'F');
  }

  // Text inside box
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(80);
  
  const sigTextX = boxX + 26;
  let sigCursor = cursorY + 5;
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("FIRMADO DIGITALMENTE", sigTextX, sigCursor);
  sigCursor += 3;
  
  doc.setFont("helvetica", "normal");
  doc.text(`POR: ${data.senderName.toUpperCase()}`, sigTextX, sigCursor);
  sigCursor += 3;
  doc.text(`ENTIDAD: MINISTERIO DE RELACIONES EXTERIORES`, sigTextX, sigCursor);
  sigCursor += 3;
  doc.text(`FECHA: ${new Date().toLocaleDateString()}`, sigTextX, sigCursor);

  // --- Footer & Seal ---
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150);
    
    // Initials
    if (data.footerInitials) {
        doc.text(data.footerInitials, marginX, pageHeight - 15);
    }
    
    // Official Address
    doc.text("Jr. Lampa 545, Lima 1, Perú - www.gob.pe/rree", pageWidth - marginX, pageHeight - 15, { align: 'right' });
    
    // OFFICIAL RED SEAL
    doc.setFontSize(7);
    doc.setTextColor(150, 0, 0); // Red
    doc.setFont("helvetica", "bold");
    const sealText = "[SELLO: MINISTERIO DE RELACIONES EXTERIORES – SECRETARÍA GENERAL – ORIGINAL]";
    
    // Drawing a box for the seal text
    doc.setDrawColor(150, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(marginX, pageHeight - 28, 120, 8);
    doc.text(sealText, marginX + 2, pageHeight - 22);
  }

  doc.save(`${data.documentNumber.replace(/[\/\\.]/g, '_')}.pdf`);
};