export enum DocumentType {
  OFICIO = 'Oficio',
  MEMORANDUM = 'Memorándum',
  CARTA_DIPLOMATICA = 'Carta Diplomática',
  INFORME_TECNICO = 'Informe Técnico',
  RESOLUCION_MINISTERIAL = 'Resolución Ministerial',
}

export interface GeneratedDocumentData {
  documentType: DocumentType; // Added to control layout
  documentNumber: string; // e.g., OFICIO N.° 023-2025-MRE/SG
  yearName: string; // e.g., "Año del Bicentenario..."
  cityAndDate: string; // e.g., Lima, 10 de Octubre de 2025
  urgency: 'Normal' | 'Urgente' | 'Muy Urgente';
  recipientName: string;
  recipientTitle: string;
  recipientEntity: string;
  senderName: string;
  senderTitle: string;
  senderEntity: string; // Usually Ministerio de Relaciones Exteriores
  subject: string;
  bodyParagraphs: string[];
  reference?: string;
  footerInitials?: string;
}

export interface FormData {
  docType: DocumentType;
  topic: string; // From TUPA list
  customRecipient?: string;
  customSender?: string;
  urgency: 'Normal' | 'Urgente' | 'Muy Urgente';
}

export interface TupaProcedure {
  id: number;
  name: string;
  isService?: boolean;
}