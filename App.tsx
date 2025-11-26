import React, { useState } from 'react';
import InputForm from './components/InputForm';
import DocumentPreview from './components/DocumentPreview';
import { FormData, GeneratedDocumentData } from './types';
import { generateDocumentContent } from './services/geminiService';
import { Loader2, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [generatedData, setGeneratedData] = useState<GeneratedDocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDocumentContent(formData);
      setGeneratedData(data);
    } catch (err) {
      setError("Error al conectar con el servicio de IA. Verifique su API Key o intente nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans">
      {/* Navbar */}
      <nav className="bg-red-900 text-white px-6 py-4 shadow-lg flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full">
                <ShieldCheck className="w-6 h-6 text-red-900" />
            </div>
            <div>
                <h1 className="text-xl font-serif font-bold tracking-wide">MRE SIMULATOR</h1>
                <p className="text-xs text-red-200 uppercase tracking-wider">Generador de Documentos Oficiales </p>
            </div>
        </div>
        <div className="text-xs bg-red-950 px-3 py-1 rounded border border-red-800 hidden md:block">
             Uso Exclusivo: Pruebas y Desarrollo
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 h-[calc(100vh-80px)] overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-6">
          
          {/* Left: Input Panel */}
          <div className="w-full md:w-1/3 h-full">
             <InputForm onGenerate={handleGenerate} isLoading={loading} />
             {error && (
               <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                 {error}
               </div>
             )}
          </div>

          {/* Right: Preview Panel */}
          <div className="w-full md:w-2/3 h-full">
             {loading ? (
                 <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-inner">
                     <Loader2 className="w-12 h-12 text-red-800 animate-spin mb-4" />
                     <p className="text-lg font-serif text-gray-600">Redactando documento oficial...</p>
                     <p className="text-sm text-gray-400 mt-2">Consultando normativa vigente...</p>
                 </div>
             ) : (
                <DocumentPreview 
                    data={generatedData} 
                    onDownload={() => { /* Handled in component */ }} 
                />
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
