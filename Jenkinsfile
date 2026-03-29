pipeline {
    agent any

    stages {
        stage('Check Tools') {
            steps {
                sh '''
                docker version
                docker-compose version
                git --version
                ls /home/ubuntu/cloud_projet
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                set -e
                git config --global --add safe.directory /home/ubuntu/cloud_projet
                cd /home/ubuntu/cloud_projet

                git pull origin main || git pull origin master || true

                docker-compose -f docker-compose.prod.yml build frontend ctfd ctfd-nginx
                docker-compose -f docker-compose.prod.yml up -d --no-deps frontend ctfd ctfd-nginx
                '''
            }
        }
    }
}
