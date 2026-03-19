import type { PipelineConfig, Step } from '@/types/pipeline';

function indent(text: string, level: number): string {
  const spaces = '    '.repeat(level);
  return text.split('\n').map(line => line.trim() ? spaces + line : '').join('\n');
}

function generateStep(step: Step, level: number): string {
  const i = '    '.repeat(level);
  switch (step.type) {
    case 'sh':
      return `${i}sh '${(step.config.command || '').replace(/'/g, "\\'")}'`;
    case 'echo':
      return `${i}echo '${(step.config.message || '').replace(/'/g, "\\'")}'`;
    case 'git':
      return `${i}git url: '${step.config.url || ''}', branch: '${step.config.branch || 'main'}'`;
    case 'archiveArtifacts':
      return `${i}archiveArtifacts artifacts: '${step.config.pattern || '**/*'}', fingerprint: true`;
    case 'junit':
      return `${i}junit '${step.config.pattern || '**/test-results/*.xml'}'`;
    case 'slackSend':
      return `${i}slackSend channel: '${step.config.channel || ''}', message: '${(step.config.message || '').replace(/'/g, "\\'")}'`;
    case 'emailext':
      return `${i}emailext subject: '${step.config.subject || ''}', body: '${step.config.body || ''}', to: '${step.config.to || ''}'`;
    case 'withCredentials':
      return `${i}withCredentials([usernamePassword(credentialsId: '${step.config.credentialsId || ''}', usernameVariable: '${step.config.usernameVar || 'USER'}', passwordVariable: '${step.config.passwordVar || 'PASS'}')]) {\n${i}    ${step.config.body || '// use $USER and $PASS'}\n${i}}`;
    case 'script':
      return `${i}script {\n${indent(step.config.code || '// custom groovy', level + 1)}\n${i}}`;
    default:
      return `${i}// Unknown step type: ${step.type}`;
  }
}

export function generateGroovy(config: PipelineConfig): string {
  const lines: string[] = [];

  // Custom script outside pipeline block
  if (config.customScript?.trim()) {
    lines.push(config.customScript.trim());
    lines.push('');
  }

  lines.push('pipeline {');

  // Agent
  if (config.agent === 'none') {
    lines.push('    agent none');
  } else if (config.agent.includes('{')) {
    lines.push(`    agent ${config.agent}`);
  } else {
    lines.push(`    agent ${config.agent}`);
  }

  // Environment
  if (config.environment.length > 0) {
    lines.push('');
    lines.push('    environment {');
    config.environment.forEach(env => {
      lines.push(`        ${env.key} = '${env.value}'`);
    });
    lines.push('    }');
  }

  // Parameters
  if (config.parameters.length > 0) {
    lines.push('');
    lines.push('    parameters {');
    config.parameters.forEach(param => {
      switch (param.type) {
        case 'string':
          lines.push(`        string(name: '${param.name}', defaultValue: '${param.defaultValue}', description: '${param.description}')`);
          break;
        case 'boolean':
          lines.push(`        booleanParam(name: '${param.name}', defaultValue: ${param.defaultValue || 'false'}, description: '${param.description}')`);
          break;
        case 'choice':
          lines.push(`        choice(name: '${param.name}', choices: [${(param.choices || []).map(c => `'${c}'`).join(', ')}], description: '${param.description}')`);
          break;
        case 'text':
          lines.push(`        text(name: '${param.name}', defaultValue: '${param.defaultValue}', description: '${param.description}')`);
          break;
      }
    });
    lines.push('    }');
  }

  // Stages
  if (config.stages.length > 0) {
    lines.push('');
    lines.push('    stages {');
    config.stages.forEach(stage => {
      lines.push(`        stage('${stage.name}') {`);
      lines.push('            steps {');
      if (stage.steps.length === 0) {
        lines.push("                echo 'No steps defined'");
      } else {
        stage.steps.forEach(step => {
          lines.push(generateStep(step, 4));
        });
      }
      lines.push('            }');
      lines.push('        }');
    });
    lines.push('    }');
  }

  // Post actions
  const hasPost = config.postActions.success || config.postActions.failure || config.postActions.always;
  if (hasPost) {
    lines.push('');
    lines.push('    post {');
    if (config.postActions.always) {
      lines.push('        always {');
      lines.push(`            ${config.postActions.always}`);
      lines.push('        }');
    }
    if (config.postActions.success) {
      lines.push('        success {');
      lines.push(`            ${config.postActions.success}`);
      lines.push('        }');
    }
    if (config.postActions.failure) {
      lines.push('        failure {');
      lines.push(`            ${config.postActions.failure}`);
      lines.push('        }');
    }
    lines.push('    }');
  }

  lines.push('}');
  return lines.join('\n');
}
