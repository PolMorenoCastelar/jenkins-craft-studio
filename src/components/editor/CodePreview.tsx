import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  code: string;
}

export default function CodePreview({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Jenkinsfile';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Jenkinsfile descargado');
  };

  const highlighted = useMemo(() => highlightGroovy(code), [code]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">Jenkinsfile</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDownload}>
            <Download className="h-3 w-3" />
            Descargar
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-xs leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
}

function highlightGroovy(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Keywords
    .replace(/\b(pipeline|agent|stages|stage|steps|environment|parameters|post|script|node|def|return|if|else|for|while|try|catch|finally|true|false|null)\b/g,
      '<span style="color: hsl(263, 70%, 60%)">$1</span>')
    // Strings
    .replace(/'([^']*)'/g, '<span style="color: hsl(160, 84%, 39%)">\'$1\'</span>')
    // Comments
    .replace(/(\/\/.*$)/gm, '<span style="color: hsl(215, 20%, 45%)">$1</span>')
    // Functions
    .replace(/\b(sh|echo|git|archiveArtifacts|junit|slackSend|emailext|withCredentials|booleanParam|string|choice|text)\b(?=[\s(])/g,
      '<span style="color: hsl(217, 91%, 60%)">$1</span>');
}
