import { Link } from 'react-router-dom';
import { ArrowRight, ScanLine, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-white">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50 to-white -z-10"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          Extract Data from <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">Malpot Documents</span>
        </h1>
        
        <p className="mt-4 text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 font-light">
          Upload your scanned documents and let our advanced OCR engine automatically extract, parse, and save land and ownership data with high accuracy.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
          <Link 
            to="/scan" 
            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            <ScanLine size={24} />
            Start Scanning
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/register" 
            className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl font-semibold text-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-300"
          >
            Create an Account
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap size={32} className="text-amber-500" />, title: 'Lightning Fast OCR', desc: 'Process documents in seconds with our optimized Nepalese & English text recognition engine.' },
            { icon: <ScanLine size={32} className="text-indigo-500" />, title: 'Smart Parsing', desc: 'Automatically identifies Kitta numbers, owners, dimensions, and standardizes data.' },
            { icon: <ShieldCheck size={32} className="text-teal-500" />, title: 'Secure & Reliable', desc: 'Your documents are safely stored and processed with enterprise-grade security.' },
          ].map((feature, idx) => (
            <div key={idx} className="glass p-8 rounded-3xl text-left hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
