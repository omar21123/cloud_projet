pipeline {
    agent any

    stages {
        stage('Checkout & Submodules') {
            steps {
<<<<<<< HEAD
                sh '''
                docker version
                docker compose version
                git --version
                ls -la
                '''
=======
                // Force Jenkins à récupérer les sous-modules si CTFd en est un
                checkout scm: [
                    $class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    extensions: [[$class: 'SubmoduleOption', recursiveSubmodules: true]], 
                    userRemoteConfigs: [[url: 'https://github.com/omar21123/cloud_projet.git']]
                ]
>>>>>>> 8e137f1 (Fix: Update Jenkinsfile and add CTFd source files)
            }
        }

        stage('Deploy') {
            steps {
<<<<<<< HEAD
                // On lance le déploiement directement dans le répertoire où Jenkins a cloné le code
                sh 'docker compose -f docker-compose.prod.yml up -d --build frontend ctfd ctfd-nginx'
=======
                sh '''
                # On crée un fichier .env temporaire pour que docker-compose ne râle pas
                # En prod, on utiliserait les "Credentials" Jenkins pour la sécurité
                echo "DB_PASSWORD=root" > .env
                echo "CTFD_SECRET_KEY=secret" >> .env
                echo "DB_ROOT_PASSWORD=root" >> .env

                # On ne build que le frontend pour l'instant si CTFd n'est pas prêt
                docker compose -f docker-compose.prod.yml up -d --build frontend
                '''
>>>>>>> 8e137f1 (Fix: Update Jenkinsfile and add CTFd source files)
            }
        }
    }
}
