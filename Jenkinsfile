pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Validate files') {
      steps {
        sh '''
          test -f /opt/apps/jenkins-craft-studio/docker-compose.yml
          test -f /opt/apps/jenkins-craft-studio/src/Dockerfile
          test -f /opt/apps/jenkins-craft-studio/src/nginx.conf
        '''
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          cd /opt/apps/jenkins-craft-studio
          docker compose up -d --build
        '''
      }
    }

    stage('Cleanup') {
      steps {
        sh '''
          docker image prune -f
        '''
      }
    }
  }

  post {
    success {
      echo 'Despliegue completado correctamente'
    }
    failure {
      echo 'El despliegue ha fallado'
    }
    always {
      sh 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
    }
  }
}
