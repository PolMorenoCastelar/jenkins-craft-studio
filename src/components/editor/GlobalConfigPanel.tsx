import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings, Variable, SlidersHorizontal } from 'lucide-react';
import type { PipelineConfig, EnvVar, Parameter } from '@/types/pipeline';

interface Props {
  config: PipelineConfig;
  onChange: (config: PipelineConfig) => void;
}

export default function GlobalConfigPanel({ config, onChange }: Props) {
  const addEnvVar = () => {
    onChange({ ...config, environment: [...config.environment, { key: '', value: '' }] });
  };

  const updateEnvVar = (index: number, field: keyof EnvVar, value: string) => {
    const envs = [...config.environment];
    envs[index] = { ...envs[index], [field]: value };
    onChange({ ...config, environment: envs });
  };

  const removeEnvVar = (index: number) => {
    onChange({ ...config, environment: config.environment.filter((_, i) => i !== index) });
  };

  const addParameter = () => {
    onChange({
      ...config,
      parameters: [
        ...config.parameters,
        { type: 'string', name: '', defaultValue: '', description: '' },
      ],
    });
  };

  const updateParameter = (index: number, field: keyof Parameter, value: string) => {
    const params = [...config.parameters];
    params[index] = { ...params[index], [field]: value } as Parameter;
    onChange({ ...config, parameters: params });
  };

  const removeParameter = (index: number) => {
    onChange({ ...config, parameters: config.parameters.filter((_, i) => i !== index) });
  };

  const validateVarName = (name: string): boolean => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);

  return (
    <div className="space-y-6 p-4 overflow-y-auto h-full">
      {/* Agent */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings className="h-4 w-4 text-primary" />
          Agent
        </div>
        <Select value={config.agent} onValueChange={(v) => onChange({ ...config, agent: v })}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="any">any</SelectItem>
            <SelectItem value="none">none</SelectItem>
            <SelectItem value="{ docker { image 'node:18' } }">Docker (Node 18)</SelectItem>
            <SelectItem value="{ docker { image 'maven:3.9' } }">Docker (Maven 3.9)</SelectItem>
            <SelectItem value="{ docker { image 'python:3.11' } }">Docker (Python 3.11)</SelectItem>
            <SelectItem value="{ label 'linux' }">Label (linux)</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Environment */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Variable className="h-4 w-4 text-secondary" />
            Variables de Entorno
          </div>
          <Button variant="ghost" size="sm" onClick={addEnvVar}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {config.environment.map((env, i) => (
          <div key={i} className="flex gap-2 items-start animate-fade-in">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="KEY"
                value={env.key}
                onChange={(e) => updateEnvVar(i, 'key', e.target.value.toUpperCase())}
                className={`bg-background font-mono text-xs ${env.key && !validateVarName(env.key) ? 'border-destructive' : ''}`}
              />
              {env.key && !validateVarName(env.key) && (
                <p className="text-[10px] text-destructive">Nombre inválido</p>
              )}
            </div>
            <Input
              placeholder="value"
              value={env.value}
              onChange={(e) => updateEnvVar(i, 'value', e.target.value)}
              className="flex-1 bg-background font-mono text-xs"
            />
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeEnvVar(i)}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </section>

      {/* Parameters */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Parameters
          </div>
          <Button variant="ghost" size="sm" onClick={addParameter}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {config.parameters.map((param, i) => (
          <div key={i} className="space-y-2 bg-background/50 rounded-md p-3 animate-fade-in">
            <div className="flex gap-2">
              <Select value={param.type} onValueChange={(v) => updateParameter(i, 'type', v)}>
                <SelectTrigger className="w-28 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="choice">Choice</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="nombre"
                value={param.name}
                onChange={(e) => updateParameter(i, 'name', e.target.value)}
                className={`flex-1 bg-background font-mono text-xs ${param.name && !validateVarName(param.name) ? 'border-destructive' : ''}`}
              />
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeParameter(i)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
            <Input
              placeholder="Valor por defecto"
              value={param.defaultValue}
              onChange={(e) => updateParameter(i, 'defaultValue', e.target.value)}
              className="bg-background text-xs"
            />
            <Input
              placeholder="Descripción"
              value={param.description}
              onChange={(e) => updateParameter(i, 'description', e.target.value)}
              className="bg-background text-xs"
            />
          </div>
        ))}
      </section>

      {/* Post Actions */}
      <section className="space-y-3">
        <div className="text-sm font-medium text-foreground">Post Actions</div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Always</Label>
          <Input
            placeholder="echo 'Pipeline finished'"
            value={config.postActions.always}
            onChange={(e) => onChange({ ...config, postActions: { ...config.postActions, always: e.target.value } })}
            className="bg-background font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Success</Label>
          <Input
            placeholder="echo 'Success!'"
            value={config.postActions.success}
            onChange={(e) => onChange({ ...config, postActions: { ...config.postActions, success: e.target.value } })}
            className="bg-background font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Failure</Label>
          <Input
            placeholder="echo 'Failed!'"
            value={config.postActions.failure}
            onChange={(e) => onChange({ ...config, postActions: { ...config.postActions, failure: e.target.value } })}
            className="bg-background font-mono text-xs"
          />
        </div>
      </section>

      {/* Custom Groovy */}
      <section className="space-y-3">
        <div className="text-sm font-medium text-foreground">Script Personalizado</div>
        <p className="text-[10px] text-muted-foreground">Funciones Groovy fuera del bloque pipeline {'{}'}</p>
        <Textarea
          value={config.customScript}
          onChange={(e) => onChange({ ...config, customScript: e.target.value })}
          placeholder="def myFunction() { ... }"
          className="bg-background font-mono text-xs min-h-[100px]"
        />
      </section>
    </div>
  );
}
