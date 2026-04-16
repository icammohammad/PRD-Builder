import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (chart) {
      try {
        // Encode the mermaid chart to base64 for mermaid.ink
        const encoded = btoa(unescape(encodeURIComponent(chart.trim())));
        setImageUrl(`https://mermaid.ink/img/${encoded}`);
      } catch (err) {
        console.error('Error encoding mermaid chart:', err);
      }
    }
  }, [chart]);

  if (!imageUrl) {
    return (
      <div className="flex items-center gap-2 text-slate-400 animate-pulse my-8">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
        <span className="text-sm">Menghasilkan diagram...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-8 space-y-2">
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <img 
          src={imageUrl} 
          alt="Sequence Diagram" 
          className="max-w-full h-auto"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback if mermaid.ink fails
            console.error('Mermaid.ink failed to load image');
            e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Gagal+Merender+Diagram';
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Sequence Diagram (Visual Image)</span>
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-blue-500 hover:underline font-mono uppercase tracking-widest"
        >
          [Buka Gambar]
        </a>
      </div>
    </div>
  );
};

export default Mermaid;
