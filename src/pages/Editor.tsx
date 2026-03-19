import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useProjects } from '@/hooks/useProjects';
import { generateGroovy } from '@/lib/generateGroovy';
import GlobalConfigPanel from '@/components/editor/GlobalConfigPanel';
import StageBuilder from '@/components/editor/StageBuilder';
import CodePreview from '@/components/editor/CodePreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, PanelLeftClose, PanelLeft, GitBranch } from 'lucide-react';
import type { PipelineConfig, Project } from '@/types/pipeline';
import { defaultPipelineConfig } from '@/types/pipeline';
import { toast } from 'sonner';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [config, setConfig] = useState<PipelineConfig>(defaultPipelineConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Proyecto no encontrado');
          navigate('/');
          return;
        }
        setProject(data as unknown as Project);
        setConfig(data.json_config as unknown as PipelineConfig);
        setLoading(false);
      });
  }, [id, navigate]);

  const groovy = generateGroovy(config);

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    await updateProject.mutateAsync({ id, json_config: config, generated_groovy: groovy });
    setSaving(false);
    toast.success('Guardado');
  }, [id, config, groovy, updateProject]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <GitBranch className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {project?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Guardar
          </Button>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-r border-border shrink-0 overflow-hidden">
            <GlobalConfigPanel config={config} onChange={setConfig} />
          </div>
        )}

        {/* Center - Stage Builder */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <StageBuilder config={config} onChange={setConfig} />
        </div>

        {/* Right - Code Preview */}
        <div className="w-[400px] border-l border-border shrink-0 overflow-hidden bg-card/30">
          <CodePreview code={groovy} />
        </div>
      </div>
    </div>
  );
}
