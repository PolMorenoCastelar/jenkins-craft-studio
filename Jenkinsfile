pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
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
  }

  post {
    success {
      echo 'Despliegue completado correctamente'
    }
    failure {
      echo 'El despliegue ha fallado'
    }
  }
}
