pipeline {
    agent any

    stages {
        stage('Check Tools') {
            steps {
                sh '''
                docker version
                docker compose version
                git --version
                ls -la
                '''
            }
        }

        stage('Deploy') {
            steps {
                // On lance le déploiement directement dans le répertoire où Jenkins a cloné le code
                sh 'docker compose -f docker-compose.prod.yml up -d --build frontend ctfd ctfd-nginx'
            }
        }
    }
}
