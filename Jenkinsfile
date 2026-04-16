pipeline {
    agent any

    environment {
        // Nom du projet Compose
        COMPOSE_PROJECT = "cloud_projet"
        COMPOSE_FILE    = "docker-compose.prod.yml"
        IMAGE_FRONTEND  = "cloud_projet-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // STAGE 1 : Scan avant le build (fichiers sources)
        stage('Security Scan — Source Files') { 
            steps {
                echo '🔍 Scan Trivy des fichiers sources (frontend)...'
                sh '''
                docker run --rm \
                    -v "$(pwd)/frontend":/scan:ro \
                    aquasec/trivy:latest fs \
                    --severity HIGH,CRITICAL \
                    --exit-code 0 \
                    --format table \
                    /scan
                '''
            }
        }

        // STAGE 2 : Build & Deploy
        stage('Build & Deploy') {
            environment {
                ENV_DB_ROOT_PASSWORD = credentials('DB_ROOT_PASSWORD')
                ENV_DB_PASSWORD      = credentials('DB_PASSWORD')
                ENV_CTFD_SECRET_KEY  = credentials('CTFD_SECRET_KEY')
                ENV_MARIADB_USER      = credentials('MARIADB_USER')
                ENV_MARIADB_DATABASE = credentials('MARIADB_DATABASE')
                ENV_DATABASE_URL     = credentials('DATABASE_URL')
                ENV_REDIS_URL        = credentials('REDIS_URL')
            }
            steps {
                sh '''
                # Création du fichier .env
                echo "DB_ROOT_PASSWORD=${ENV_DB_ROOT_PASSWORD}" > .env
                echo "DB_PASSWORD=${ENV_DB_PASSWORD}"          >> .env
                echo "CTFD_SECRET_KEY=${ENV_CTFD_SECRET_KEY}"  >> .env
                echo "MARIADB_USER=${ENV_MARIADB_USER}"        >> .env
                echo "MARIADB_DATABASE=${ENV_MARIADB_DATABASE}">> .env
                echo "DATABASE_URL=${ENV_DATABASE_URL}"        >> .env
                echo "REDIS_URL=${ENV_REDIS_URL}"              >> .env

                # Déploiement du frontend uniquement pour mise à jour rapide
                docker compose -p ${COMPOSE_PROJECT} \
                               -f ${COMPOSE_FILE} \
                               up -d --build frontend
                '''
            }
        }

        // STAGE 3 : Scan après le build (Image Docker générée)
        stage('Security Scan — Docker Image') {
            steps {
                echo '🔍 Scan Trivy de l image Docker finale...'
                sh '''
                docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image \
                    --severity HIGH,CRITICAL \
                    --exit-code 0 \
                    --format table \
                    ${IMAGE_FRONTEND}
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline complet — site à jour sur project-cloud.online'
        }
        failure {
            echo '❌ Pipeline échoué — vérifiez les logs ci-dessus'
        }
        always {
            sh 'rm -f .env'
        }
    }
}
