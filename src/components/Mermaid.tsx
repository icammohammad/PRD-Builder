import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with some basic settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;

      try {
        setError(null);
        // Sanitize chart content (remove potential markdown wrappers if any)
        const sanitizedChart = chart.trim()
          .replace(/^```mermaid\n?/, '')
          .replace(/\n?```$/, '');

        // Generate a random ID for the diagram
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        
        // Render the diagram to an SVG string
        const { svg: renderedSvg } = await mermaid.render(id, sanitizedChart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError('Failed to render diagram. Syntax might be invalid.');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-8 p-6 border-2 border-dashed border-red-100 rounded-2xl bg-red-50/50 flex flex-col items-center gap-2">
        <span className="text-sm font-semibold text-red-600">Diagram Visualization Error</span>
        <span className="text-xs text-red-400 font-mono text-center">AI generated invalid mermaid syntax. Please try revising the prompt.</span>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center py-12 my-8 border border-slate-100 rounded-2xl bg-slate-50/50 animate-pulse">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-medium">Architecting Visualization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-8 space-y-4">
      <div 
        className="w-full bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-x-auto flex justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Local System Architecture View</span>
      </div>
    </div>
  );
};

export default Mermaid;
