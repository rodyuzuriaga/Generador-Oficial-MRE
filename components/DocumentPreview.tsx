import React from 'react';
import { GeneratedDocumentData, DocumentType } from '../types';
import { Download } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { MRE_LOGO_URL } from '../constants';

interface DocumentPreviewProps {
  data: GeneratedDocumentData | null;
  onDownload: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ data, onDownload }) => {
  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <FileIconPlaceholder />
        <p className="mt-4 text-lg font-serif">Configure y genere un documento oficial.</p>
      </div>
    );
  }

  const isResolution = data.documentType === DocumentType.RESOLUCION_MINISTERIAL;
  const isMemo = data.documentType === DocumentType.MEMORANDUM;
  const isInforme = data.documentType === DocumentType.INFORME_TECNICO;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            Vista Previa
            <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">
                Simulador Oficial
            </span>
        </h3>
        <button
          onClick={() => generatePDF(data)}
          className="flex items-center gap-2 bg-red-900 text-white px-4 py-2 rounded hover:bg-red-800 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Descargar PDF Oficial
        </button>
      </div>

      <div className="flex-1 bg-stone-200 overflow-y-auto p-4 rounded-lg shadow-inner">
        {/* Paper Container */}
        <div id="document-content" className="bg-white max-w-[210mm] mx-auto min-h-[297mm] shadow-2xl p-[25mm] relative font-document text-[11pt] text-gray-900 leading-normal">
            
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none overflow-hidden">
                 <img src={MRE_LOGO_URL} className="w-[70%] grayscale" alt="watermark" />
            </div>

            {/* Header Layout based on type */}
            <header className="mb-8 relative z-10">
                <div className="flex justify-between items-start mb-2">
                    {/* Logo Area - Adjusted width for horizontal logo */}
                    <div className="w-48">
                         <img src={MRE_LOGO_URL} alt="Logo MRE" className="w-full h-auto object-contain" />
                    </div>
                    {/* Year Name - Right Aligned and Red */}
                    <div className="flex-1 ml-4 text-right pt-2">
                        <p className="text-[7pt] uppercase text-red-900 font-bold font-sans tracking-wide leading-tight">
                            "{data.yearName}"
                        </p>
                    </div>
                </div>
                
                {/* Specific Header Structures */}
                {isResolution ? (
                    <div className="mt-12 text-center">
                         <h1 className="text-xl font-bold underline decoration-1 underline-offset-4 mb-6">{data.documentNumber}</h1>
                         <div className="text-right mb-6">
                            <p>{data.cityAndDate}</p>
                         </div>
                    </div>
                ) : (
                   <>
                       <div className="mt-8 mb-6">
                            <h1 className="text-xl font-bold">{data.documentNumber}</h1>
                       </div>
                       <div className="text-right mb-6">
                            <p>{data.cityAndDate}</p>
                       </div>
                   </>
                )}
            </header>

            {/* Recipient / Meta Data Section */}
            {!isResolution && (
                <section className="mb-8 relative z-10">
                    {isMemo || isInforme ? (
                        <div className="grid grid-cols-[80px_1fr] gap-y-2 uppercase text-[10pt]">
                             <span className="font-bold">A</span>
                             <span>: {data.recipientName} - {data.recipientTitle}</span>
                             
                             <span className="font-bold">DE</span>
                             <span>: {data.senderName} - {data.senderTitle}</span>
                             
                             <span className="font-bold">ASUNTO</span>
                             <span>: {data.subject}</span>
                             
                             <span className="font-bold">FECHA</span>
                             <span>: {data.cityAndDate}</span>

                             {data.reference && (
                                <>
                                    <span className="font-bold">REF.</span>
                                    <span>: {data.reference}</span>
                                </>
                             )}
                             <div className="col-span-2 border-b border-black my-2"></div>
                        </div>
                    ) : (
                        // Standard Oficio/Carta
                        <div className="mb-6">
                            <p className="font-bold">Señor(a):</p>
                            <p className="uppercase font-bold">{data.recipientName}</p>
                            <p>{data.recipientTitle}</p>
                            <p>{data.recipientEntity}</p>
                            <p className="mt-1">Presente.-</p>
                            
                            <div className="mt-4 flex gap-2">
                                <span className="font-bold min-w-[70px]">Asunto:</span>
                                <p className="text-justify">{data.subject}</p>
                            </div>
                            {data.reference && (
                                <div className="flex gap-2">
                                    <span className="font-bold min-w-[70px]">Ref.:</span>
                                    <p>{data.reference}</p>
                                </div>
                            )}
                            <div className="border-t border-gray-400 w-full my-4"></div>
                        </div>
                    )}
                </section>
            )}

            {/* Body */}
            <section className={`space-y-4 text-justify relative z-10 ${isResolution ? 'mt-4' : ''}`}>
                {data.bodyParagraphs.map((para, idx) => {
                    const isResolutionKeyWord = para.startsWith("SE RESUELVE") || para.startsWith("Vistos") || para.startsWith("CONSIDERANDO");
                    const isArticle = para.startsWith("Artículo");
                    
                    if (isResolution && isResolutionKeyWord) {
                        return <p key={idx} className="font-bold mt-6 mb-2">{para}</p>;
                    }
                    if (isResolution && isArticle) {
                         return <p key={idx} className="pl-8 font-bold text-black">{para}</p>;
                    }

                    return <p key={idx} className={isResolution ? "pl-8" : ""}>{para}</p>;
                })}
            </section>

            {/* Signature Area */}
            <section className="mt-24 flex flex-col items-center justify-center relative z-10 page-break-avoid">
                {/* Simulated Ink Signature Line */}
                <div className="w-64 border-t border-black mb-2"></div>
                
                <p className="font-bold uppercase text-[10pt]">{data.senderName}</p>
                <p className="text-[9pt] text-gray-800 uppercase">{data.senderTitle}</p>
                <p className="text-[9pt] text-gray-800">{data.senderEntity}</p>
                
                {/* Official Digital Signature Box (Peru Style) */}
                <div className="mt-8 border-2 border-gray-300 bg-white p-2 flex items-center gap-3 w-[280px] h-[90px]">
                    <div className="h-full w-20 bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {/* Fake QR */}
                        <div className="w-16 h-16 bg-white p-1 border border-black flex flex-wrap content-start">
                             {[...Array(25)].map((_,i) => (
                                 <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />
                             ))}
                        </div>
                    </div>
                    <div className="flex-1 text-[7pt] text-gray-600 leading-tight font-sans">
                        <p className="font-bold text-black mb-1">FIRMADO DIGITALMENTE</p>
                        <p><span className="font-semibold">POR:</span> {data.senderName.toUpperCase()}</p>
                        <p><span className="font-semibold">ENTIDAD:</span> MINISTERIO DE RELACIONES EXTERIORES</p>
                        <p><span className="font-semibold">FECHA:</span> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                        <p className="mt-1 text-[6pt] text-gray-400">Firmado con certificado digital oficial</p>
                    </div>
                </div>
            </section>

            {/* Footer / Sello Textual */}
            <footer className="mt-12 text-[8pt] text-gray-500 font-sans relative z-10">
                <div className="flex justify-between items-end">
                    <div>
                         <p>{data.footerInitials || 'MRE/sg'}</p>
                         <div className="mt-4 border-2 border-red-900 text-red-900 px-3 py-1 font-bold text-[7pt] inline-block tracking-wider uppercase opacity-80 rotate-[-2deg]">
                            [SELLO: MINISTERIO DE RELACIONES EXTERIORES – SECRETARÍA GENERAL – ORIGINAL]
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="border-t border-gray-300 pt-1 w-64 ml-auto">
                            <span>Jr. Lampa 545, Lima 1, Perú</span><br/>
                            <span>Central Telefónica: (511) 204-2400</span><br/>
                            <span>www.gob.pe/rree</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
};

const FileIconPlaceholder = () => (
    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export default DocumentPreview;