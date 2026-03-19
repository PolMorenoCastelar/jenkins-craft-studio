export interface EnvVar {
  key: string;
  value: string;
}

export interface Parameter {
  type: 'string' | 'boolean' | 'choice' | 'text';
  name: string;
  defaultValue: string;
  description: string;
  choices?: string[];
}

export interface Step {
  id: string;
  type: 'sh' | 'git' | 'archiveArtifacts' | 'junit' | 'echo' | 'slackSend' | 'emailext' | 'withCredentials' | 'script';
  config: Record<string, string>;
}

export interface Stage {
  id: string;
  name: string;
  steps: Step[];
}

export interface PipelineConfig {
  agent: string;
  environment: EnvVar[];
  parameters: Parameter[];
  stages: Stage[];
  postActions: {
    success: string;
    failure: string;
    always: string;
  };
  customScript: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  json_config: PipelineConfig;
  generated_groovy: string;
  created_at: string;
  updated_at: string;
}

export const defaultPipelineConfig: PipelineConfig = {
  agent: 'any',
  environment: [],
  parameters: [],
  stages: [],
  postActions: {
    success: '',
    failure: '',
    always: '',
  },
  customScript: '',
};

export const STEP_TYPES: { value: Step['type']; label: string; description: string }[] = [
  { value: 'sh', label: 'Shell Command', description: 'Execute a shell command' },
  { value: 'echo', label: 'Echo', description: 'Print a message' },
  { value: 'git', label: 'Git', description: 'Git operations' },
  { value: 'archiveArtifacts', label: 'Archive Artifacts', description: 'Archive build artifacts' },
  { value: 'junit', label: 'JUnit', description: 'Publish JUnit test results' },
  { value: 'slackSend', label: 'Slack Send', description: 'Send Slack notification' },
  { value: 'emailext', label: 'Email', description: 'Send email notification' },
  { value: 'withCredentials', label: 'With Credentials', description: 'Bind credentials to variables' },
  { value: 'script', label: 'Scripted Block', description: 'Custom Groovy script block' },
];
