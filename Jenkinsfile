pipeline {
    agent any

    environment {
        // Nom du projet Compose — centralisé ici pour éviter les répétitions
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

        // ══════════════════════════════════════════════════════════
        // Scan de sécurité AVANT le build
        // Analyse les dépendances npm sans construire l'image Docker
        // ══════════════════════════════════════════════════════════
        stage('Security Scan — Filesystem') {
            steps {
                echo '🔍 Scan Trivy des dépendances npm (frontend)...'
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

        // ══════════════════════════════════════════════════════════
        // Build & Deploy avec injection sécurisée des secrets
        // ══════════════════════════════════════════════════════════
        stage('Build & Deploy') {
            environment {
                // Liaison des credentials Jenkins (UI) vers des variables d'environnement locales au stage
                ENV_DB_ROOT_PASSWORD = credentials('DB_ROOT_PASSWORD')
                ENV_DB_PASSWORD      = credentials('DB_PASSWORD')
                ENV_CTFD_SECRET_KEY  = credentials('CTFD_SECRET_KEY')
                ENV_MARIADB_USER     = credentials('MARIADB_USER')
                ENV_MARIADB_DATABASE = credentials('MARIADB_DATABASE')
                ENV_DATABASE_URL     = credentials('DATABASE_URL')
                ENV_REDIS_URL        = credentials('REDIS_URL')
            }
            steps {
                sh '''
                # Création du fichier .env à la volée en utilisant les variables sécurisées
                echo "DB_ROOT_PASSWORD=${ENV_DB_ROOT_PASSWORD}" > .env
                echo "DB_PASSWORD=${ENV_DB_PASSWORD}"          >> .env
                echo "CTFD_SECRET_KEY=${ENV_CTFD_SECRET_KEY}"  >> .env
                echo "MARIADB_USER=${ENV_MARIADB_USER}"        >> .env
                echo "MARIADB_DATABASE=${ENV_MARIADB_DATABASE}">> .env
                echo "DATABASE_URL=${ENV_DATABASE_URL}"        >> .env
                echo "REDIS_URL=${ENV_REDIS_URL}"              >> .env

                # Déploiement
                docker compose -p ${COMPOSE_PROJECT} \
                               -f ${COMPOSE_FILE} \
                               up -d --build frontend
                '''
            }
        }

        // ══════════════════════════════════════════════════════════
        // Scan de l'image Docker buildée (post-build)
        // Trivy analyse l'image finale : OS packages + libs app
        // ══════════════════════════════════════════════════════════
        stage('Security Scan — Docker Image') {
            steps {
                echo '🔍 Scan Trivy de l image Docker frontend...'
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
            // Optionnel mais recommandé : supprimer le fichier .env après le déploiement
            // pour ne pas laisser de secrets en clair sur l'espace de travail Jenkins
            sh 'rm -f .env'
        }
    }
}
