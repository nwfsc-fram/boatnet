pipeline {
  agent {
    docker {
      image 'node:alpine'
    }

  }
  stages {
    stage('npm install') {
      steps {
        sh '''npm install
'''
      }
    }

  }
}