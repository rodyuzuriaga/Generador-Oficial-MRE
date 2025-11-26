import React, { useState } from 'react';
import { AVAILABLE_DOC_TYPES, TUPA_PROCEDURES } from '../constants';
import { FormData, DocumentType } from '../types';
import { FileText, Send, Sparkles } from 'lucide-react';

interface InputFormProps {
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [docType, setDocType] = useState<DocumentType>(DocumentType.OFICIO);
  const [topic, setTopic] = useState<string>(TUPA_PROCEDURES[0].name);
  const [urgency, setUrgency] = useState<'Normal' | 'Urgente' | 'Muy Urgente'>('Normal');
  const [customRecipient, setCustomRecipient] = useState('');
  const [customSender, setCustomSender] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ docType, topic, urgency, customRecipient, customSender });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 text-red-800 border-b pb-4">
        <FileText className="w-6 h-6" />
        <h2 className="text-xl font-bold font-serif">Configuración del Documento</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
          <select 
            className="w-full bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:ring-red-500 focus:border-red-500"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
          >
            {AVAILABLE_DOC_TYPES.map(type => (
              <option key={type} value={type} className="bg-slate-800 text-white">{type}</option>
            ))}
          </select>
        </div>

        {/* Topic / TUPA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Procedimiento / Asunto</label>
          <select 
            className="w-full bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:ring-red-500 focus:border-red-500"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {TUPA_PROCEDURES.map(proc => (
              <option key={proc.id} value={proc.name} className="bg-slate-800 text-white">
                {proc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Urgencia</label>
          <div className="flex gap-4">
            {['Normal', 'Urgente', 'Muy Urgente'].map((level) => (
              <label key={level} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value={level}
                  checked={urgency === level}
                  onChange={() => setUrgency(level as any)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sender (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remitente (Opcional)</label>
          <input
            type="text"
            className="w-full bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
            placeholder="Ej: Director General de Protocolo"
            value={customSender}
            onChange={(e) => setCustomSender(e.target.value)}
          />
        </div>

         {/* Recipient (Optional) */}
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario (Opcional)</label>
          <input
            type="text"
            className="w-full bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
            placeholder="Ej: Ministerio de Cultura"
            value={customRecipient}
            onChange={(e) => setCustomRecipient(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}`}
          >
            {isLoading ? (
              <>
                <Sparkles className="animate-spin w-4 h-4" />
                Generando (IA)...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generar Documento
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center italic mt-4">
          * Este sistema utiliza IA para generar documentos ficticios con fines educativos y de demostración.
        </p>
      </form>
    </div>
  );
};

export default InputForm;