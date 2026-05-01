import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader2, ScanLine } from 'lucide-react';

export default function Scan() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
      if (selected.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setResult(null);
      setError(null);
      if (selected.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview(null);
      }
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceType', 'auto');

    try {
      // Using full URL to assume backend runs on 5000 or proxy if configured.
      // Adjust if backend is on a different domain.
      const response = await axios.post('http://127.0.0.1:5000/api/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Scan Document</h1>
          <p className="mt-2 text-lg text-slate-600">Upload your Malpot document for automated data extraction.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-100 bg-white'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,application/pdf"
              />
              
              {!file ? (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                    <UploadCloud size={40} />
                  </div>
                  <div className="text-lg font-medium text-slate-700">Click to upload or drag and drop</div>
                  <p className="text-sm text-slate-500">Supports JPG, PNG, PDF up to 10MB</p>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col items-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-64 rounded-xl shadow-md object-contain" />
                  ) : (
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <FileType size={40} />
                    </div>
                  )}
                  <div className="text-lg font-medium text-slate-800">{file.name}</div>
                  <div className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); setError(null); }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleScan}
              disabled={!file || isScanning}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300 ${
                !file || isScanning 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 transform hover:-translate-y-1'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Processing Document...
                </>
              ) : (
                'Start Extraction'
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700">
                <AlertCircle className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Scan Failed</h4>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
              Extraction Results
              {result?.success && <CheckCircle className="text-emerald-500" size={24} />}
            </h3>
            
            {result ? (
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {result.data?.scan?.parsedData && (
                  <div className="grid grid-cols-2 gap-4">
                    <ResultItem label="Owner Name" value={result.data.scan.parsedData.ownerName} />
                    <ResultItem label="Kitta Number" value={result.data.scan.parsedData.kittaNumber} />
                    <ResultItem label="District" value={result.data.scan.parsedData.district} />
                    <ResultItem label="Ward" value={result.data.scan.parsedData.ward} />
                  </div>
                )}
                
                {result.data?.signatureDetected && result.data?.signatureUrl && (
                   <div>
                     <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Signature Detected</h4>
                     <img src={result.data.signatureUrl} alt="Signature crop" className="h-20 object-contain border border-slate-200 rounded-lg p-2 bg-slate-50" />
                   </div>
                )}

                <div>
                   <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Raw Extracted Text Snippet</h4>
                   <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                     {result.data?.scan?.extractedText?.substring(0, 500)}...
                   </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <ScanLine size={48} className="opacity-50" />
                <p className="text-center max-w-xs">Results will appear here after the document is processed.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function ResultItem({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="font-medium text-slate-900">{value || <span className="text-slate-400 italic">Not found</span>}</div>
    </div>
  )
}
