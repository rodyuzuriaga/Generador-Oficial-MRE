import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { FormData, GeneratedDocumentData, DocumentType } from '../types';
import { OFFICIAL_YEAR_NAME } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateDocumentContent = async (formData: FormData): Promise<GeneratedDocumentData> => {
  const { docType, topic, urgency, customRecipient, customSender } = formData;

  let specificInstructions = "";

  if (docType === DocumentType.RESOLUCION_MINISTERIAL) {
    specificInstructions = `
      ESTRUCTURA OBLIGATORIA PARA RESOLUCIÓN MINISTERIAL:
      1. El título debe ser "RESOLUCIÓN MINISTERIAL N.° [NUMERO]-2025-RE".
      2. El primer párrafo debe empezar con "Vistos; el Informe...".
      3. Luego deben seguir párrafos que empiecen con "CONSIDERANDO:" explicando la base legal.
      4. Finalmente la parte resolutiva debe usar "SE RESUELVE:" seguido de "Artículo 1.- ...", "Artículo 2.- ...".
      5. No usar saludos como "Tengo el agrado" ni despedidas como "Atentamente" en este tipo de documento.
    `;
  } else if (docType === DocumentType.MEMORANDUM) {
    specificInstructions = `
      ESTRUCTURA PARA MEMORÁNDUM:
      1. El código debe ser "MEMORÁNDUM N.° [NUMERO]-2025-MRE/[OFICINA]".
      2. El tono es interno, directo y formal.
      3. Usar encabezado tradicional (PARA, DE, ASUNTO, FECHA) en el contenido si es necesario, pero el JSON tiene campos separados.
    `;
  } else if (docType === DocumentType.INFORME_TECNICO) {
    specificInstructions = `
      ESTRUCTURA PARA INFORME TÉCNICO:
      1. El código debe ser "INFORME N.° [NUMERO]-2025-MRE/[OFICINA]".
      2. Estructurar el cuerpo en secciones: I. ANTECEDENTES, II. ANÁLISIS, III. CONCLUSIONES y IV. RECOMENDACIÓN.
    `;
  } else {
    specificInstructions = `
      ESTRUCTURA PARA OFICIO O CARTA:
      1. Código "OFICIO N.°..." o "CARTA N.°...".
      2. Estilo diplomático estándar: "Tengo el honrar de dirigirme a vuestra excelencia..." o "Tengo el agrado de dirigirme a usted...".
    `;
  }

  const prompt = `
    Actúa como un funcionario experto de la Cancillería del Perú (Ministerio de Relaciones Exteriores).
    Tu tarea es redactar un documento administrativo oficial, realista y ficticio listo para firmar.
    
    Tipo de Documento: ${docType}
    Tema/Procedimiento: ${topic}
    Urgencia: ${urgency}
    Remitente Sugerido: ${customSender || "Generar un funcionario de alto nivel del MRE (ej. Secretario General, Director General)"}
    Destinatario Sugerido: ${customRecipient || "Generar un destinatario apropiado (otra entidad pública, embajada o funcionario interno)"}
    
    ${specificInstructions}
    
    Instrucciones Generales:
    1. Usa un lenguaje extremadamente formal, burocrático y diplomático.
    2. Inventa códigos de referencia creíbles y únicos (ej. N.° 045-2025-MRE/DGA).
    3. La fecha debe ser la actual de Lima, Perú.
    4. El nombre del año debe ser el oficial proporcionado en el esquema si no se provee otro.
    
    Devuelve SOLAMENTE un objeto JSON con la siguiente estructura.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      documentType: { type: Type.STRING, enum: Object.values(DocumentType) },
      documentNumber: { type: Type.STRING, description: "Código oficial del documento" },
      yearName: { type: Type.STRING, description: "Nombre oficial del año" },
      cityAndDate: { type: Type.STRING, description: "Ciudad y fecha completa, ej: Lima, 25 de Octubre de 2025" },
      urgency: { type: Type.STRING, enum: ["Normal", "Urgente", "Muy Urgente"] },
      recipientName: { type: Type.STRING },
      recipientTitle: { type: Type.STRING },
      recipientEntity: { type: Type.STRING },
      senderName: { type: Type.STRING },
      senderTitle: { type: Type.STRING },
      senderEntity: { type: Type.STRING, description: "Generalmente Ministerio de Relaciones Exteriores" },
      subject: { type: Type.STRING, description: "Asunto del documento" },
      bodyParagraphs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Párrafos del contenido. Para resoluciones incluye los Artículos." },
      footerInitials: { type: Type.STRING, description: "Iniciales del redactor, ej: ABC/xyz" },
      reference: { type: Type.STRING, description: "Documento de referencia si aplica" }
    },
    required: ["documentNumber", "cityAndDate", "recipientName", "subject", "bodyParagraphs", "senderName", "documentType"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text) as GeneratedDocumentData;
    
    // Ensure consistent naming
    data.yearName = OFFICIAL_YEAR_NAME; 
    
    // Fallback if AI mismatches the requested type (rare)
    if (!data.documentType) data.documentType = docType;

    return data;
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
};