import { TupaProcedure, DocumentType } from './types';

export const TUPA_PROCEDURES: TupaProcedure[] = [
  { id: 1, name: "Apostilla" },
  { id: 2, name: "Legalización" },
  { id: 3, name: "Emisión de la Tarjeta del Migrante Retornado (TMR)" },
  { id: 4, name: "Otorgamiento de subvenciones económicas" },
  { id: 5, name: "Solicitud de elegibilidad para Tarjeta ABTC" },
  { id: 6, name: "Expedición de Pasaporte Electrónico Diplomático" },
  { id: 7, name: "Expedición de Pasaporte Electrónico Diplomático - Dependientes" },
  { id: 8, name: "Expedición de Pasaporte Electrónico Diplomático - Incapacidad Legal" },
  { id: 9, name: "Expedición de Pasaporte Electrónico Especial" },
  { id: 10, name: "Expedición de Pasaporte Electrónico Especial – Dependientes" },
  { id: 11, name: "Expedición de Pasaporte Electrónico Especial - Incapacidad Legal" },
  { id: 12, name: "Aprobación de material histórico-geográfico de límites" },
  { id: 13, name: "Acceso a la Información Pública" },
  { id: 14, name: "Inscripción en Concurso Público Academia Diplomática", isService: true },
  { id: 15, name: "Emisión de Tarjeta para viaje de negocios ABTC", isService: true },
  { id: 16, name: "Reexpedición de Tarjeta para viaje de negocios ABTC", isService: true },
  { id: 17, name: "Compra de Papel Bond (Logística)", isService: false },
  { id: 18, name: "Renovación de Visados Diplomáticos", isService: false },
  { id: 19, name: "Migración a la nube (TI)", isService: false },
  { id: 20, name: "Designación de Agregado Cultural", isService: false },
];

export const AVAILABLE_DOC_TYPES = [
  DocumentType.OFICIO,
  DocumentType.MEMORANDUM,
  DocumentType.CARTA_DIPLOMATICA,
  DocumentType.INFORME_TECNICO,
  DocumentType.RESOLUCION_MINISTERIAL,
];

export const OFFICIAL_YEAR_NAME = "Año de la recuperación y consolidación de la economía peruana";

// Horizontal Logo provided by user
export const MRE_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/1/1e/Ministerio_de_Relaciones_Exteriores_del_Peru.png";