import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import type { PipelineConfig, Stage, Step } from '@/types/pipeline';
import { STEP_TYPES } from '@/types/pipeline';

interface Props {
  config: PipelineConfig;
  onChange: (config: PipelineConfig) => void;
}

export default function StageBuilder({ config, onChange }: Props) {
  const genId = () => Math.random().toString(36).slice(2, 9);

  const addStage = () => {
    const newStage: Stage = {
      id: genId(),
      name: `Stage ${config.stages.length + 1}`,
      steps: [],
    };
    onChange({ ...config, stages: [...config.stages, newStage] });
  };

  const updateStage = (index: number, updates: Partial<Stage>) => {
    const stages = [...config.stages];
    stages[index] = { ...stages[index], ...updates };
    onChange({ ...config, stages });
  };

  const removeStage = (index: number) => {
    onChange({ ...config, stages: config.stages.filter((_, i) => i !== index) });
  };

  const moveStage = (index: number, dir: -1 | 1) => {
    const stages = [...config.stages];
    const target = index + dir;
    if (target < 0 || target >= stages.length) return;
    [stages[index], stages[target]] = [stages[target], stages[index]];
    onChange({ ...config, stages });
  };

  const addStep = (stageIndex: number, type: Step['type']) => {
    const stages = [...config.stages];
    const newStep: Step = { id: genId(), type, config: {} };
    stages[stageIndex] = {
      ...stages[stageIndex],
      steps: [...stages[stageIndex].steps, newStep],
    };
    onChange({ ...config, stages });
  };

  const updateStep = (stageIndex: number, stepIndex: number, updates: Partial<Step>) => {
    const stages = [...config.stages];
    const steps = [...stages[stageIndex].steps];
    steps[stepIndex] = { ...steps[stepIndex], ...updates };
    stages[stageIndex] = { ...stages[stageIndex], steps };
    onChange({ ...config, stages });
  };

  const removeStep = (stageIndex: number, stepIndex: number) => {
    const stages = [...config.stages];
    stages[stageIndex] = {
      ...stages[stageIndex],
      steps: stages[stageIndex].steps.filter((_, i) => i !== stepIndex),
    };
    onChange({ ...config, stages });
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Stages</h2>
        <Button size="sm" onClick={addStage}>
          <Plus className="h-3 w-3" />
          Añadir Stage
        </Button>
      </div>

      {config.stages.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <p>No hay stages. Añade uno para comenzar.</p>
        </div>
      )}

      <div className="space-y-3">
        {config.stages.map((stage, si) => (
          <div key={stage.id} className="stage-card animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={stage.name}
                onChange={(e) => updateStage(si, { name: e.target.value })}
                className="bg-background font-mono text-sm h-8 flex-1"
              />
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveStage(si, -1)} disabled={si === 0}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveStage(si, 1)} disabled={si === config.stages.length - 1}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStage(si)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2 ml-6">
              {stage.steps.map((step, sti) => (
                <StepBlock
                  key={step.id}
                  step={step}
                  onUpdate={(updates) => updateStep(si, sti, updates)}
                  onRemove={() => removeStep(si, sti)}
                />
              ))}

              <Select onValueChange={(v) => addStep(si, v as Step['type'])}>
                <SelectTrigger className="bg-background/50 border-dashed h-8 text-xs">
                  <SelectValue placeholder="+ Añadir Step" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {STEP_TYPES.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      <span className="font-mono">{st.label}</span>
                      <span className="text-muted-foreground ml-2 text-[10px]">{st.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepBlock({
  step,
  onUpdate,
  onRemove,
}: {
  step: Step;
  onUpdate: (updates: Partial<Step>) => void;
  onRemove: () => void;
}) {
  const updateConfig = (key: string, value: string) => {
    onUpdate({ config: { ...step.config, [key]: value } });
  };

  const stepType = STEP_TYPES.find((s) => s.value === step.type);

  return (
    <div className="bg-background/30 rounded-md p-3 space-y-2 animate-fade-in border border-border/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-primary">{stepType?.label || step.type}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>

      {step.type === 'sh' && (
        <Input
          placeholder="npm install && npm test"
          value={step.config.command || ''}
          onChange={(e) => updateConfig('command', e.target.value)}
          className="bg-background font-mono text-xs h-8"
        />
      )}

      {step.type === 'echo' && (
        <Input
          placeholder="Building project..."
          value={step.config.message || ''}
          onChange={(e) => updateConfig('message', e.target.value)}
          className="bg-background font-mono text-xs h-8"
        />
      )}

      {step.type === 'git' && (
        <div className="space-y-2">
          <Input placeholder="https://github.com/..." value={step.config.url || ''} onChange={(e) => updateConfig('url', e.target.value)} className="bg-background font-mono text-xs h-8" />
          <Input placeholder="main" value={step.config.branch || ''} onChange={(e) => updateConfig('branch', e.target.value)} className="bg-background font-mono text-xs h-8" />
        </div>
      )}

      {step.type === 'archiveArtifacts' && (
        <Input placeholder="**/*.jar" value={step.config.pattern || ''} onChange={(e) => updateConfig('pattern', e.target.value)} className="bg-background font-mono text-xs h-8" />
      )}

      {step.type === 'junit' && (
        <Input placeholder="**/test-results/*.xml" value={step.config.pattern || ''} onChange={(e) => updateConfig('pattern', e.target.value)} className="bg-background font-mono text-xs h-8" />
      )}

      {step.type === 'slackSend' && (
        <div className="space-y-2">
          <Input placeholder="#channel" value={step.config.channel || ''} onChange={(e) => updateConfig('channel', e.target.value)} className="bg-background font-mono text-xs h-8" />
          <Input placeholder="Build succeeded!" value={step.config.message || ''} onChange={(e) => updateConfig('message', e.target.value)} className="bg-background font-mono text-xs h-8" />
        </div>
      )}

      {step.type === 'emailext' && (
        <div className="space-y-2">
          <Input placeholder="Subject" value={step.config.subject || ''} onChange={(e) => updateConfig('subject', e.target.value)} className="bg-background text-xs h-8" />
          <Input placeholder="to@example.com" value={step.config.to || ''} onChange={(e) => updateConfig('to', e.target.value)} className="bg-background text-xs h-8" />
          <Input placeholder="Body" value={step.config.body || ''} onChange={(e) => updateConfig('body', e.target.value)} className="bg-background text-xs h-8" />
        </div>
      )}

      {step.type === 'withCredentials' && (
        <div className="space-y-2">
          <Input placeholder="credentials-id" value={step.config.credentialsId || ''} onChange={(e) => updateConfig('credentialsId', e.target.value)} className="bg-background font-mono text-xs h-8" />
          <Input placeholder="USER" value={step.config.usernameVar || ''} onChange={(e) => updateConfig('usernameVar', e.target.value)} className="bg-background font-mono text-xs h-8" />
          <Input placeholder="PASS" value={step.config.passwordVar || ''} onChange={(e) => updateConfig('passwordVar', e.target.value)} className="bg-background font-mono text-xs h-8" />
        </div>
      )}

      {step.type === 'script' && (
        <Textarea
          placeholder="// Groovy code..."
          value={step.config.code || ''}
          onChange={(e) => updateConfig('code', e.target.value)}
          className="bg-background font-mono text-xs min-h-[60px]"
        />
      )}
    </div>
  );
}
