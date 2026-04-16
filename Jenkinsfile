pipeline {
    agent any

    environment {
        COMPOSE_PROJECT = "cloud_projet"
        COMPOSE_FILE    = "docker-compose.prod.yml"
        IMAGE_FRONTEND  = "cloud_projet-frontend"
        TRIVY_IMAGE     = "ghcr.io/aquasecurity/trivy:latest"
        // Les credentials IDs définis dans l'interface Jenkins
        TELEGRAM_CREDS_ID = 'TELEGRAM_TOKEN_ID'
        TELEGRAM_CHAT_ID  = 'TELEGRAM_CHAT_ID'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Security Scan — Filesystem') {
            steps {
                echo '🔍 Scan forcé du dossier physique...'
                sh """
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                    ${TRIVY_IMAGE} image \
                    --scanners secret \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    ${IMAGE_FRONTEND}:latest
                """
            }
        }

        stage('Build & Deploy') {
            environment {
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
                echo "DB_ROOT_PASSWORD=${ENV_DB_ROOT_PASSWORD}" > .env
                echo "DB_PASSWORD=${ENV_DB_PASSWORD}" >> .env
                echo "CTFD_SECRET_KEY=${ENV_CTFD_SECRET_KEY}" >> .env
                echo "MARIADB_USER=${ENV_MARIADB_USER}" >> .env
                echo "MARIADB_DATABASE=${ENV_MARIADB_DATABASE}" >> .env
                echo "DATABASE_URL=${ENV_DATABASE_URL}" >> .env
                echo "REDIS_URL=${ENV_REDIS_URL}" >> .env

                docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} build --no-cache frontend
                docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} up -d frontend
                '''
            }
        }

        stage('Security Scan — Container Image') {
            steps {
                echo '🔍 Scan profond de l image (OS + Secrets)...'
                sh """
                docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    ${TRIVY_IMAGE} image \
                    --scanners vuln,secret \
                    --exit-code 1 \
                    --severity HIGH,CRITICAL \
                    ${IMAGE_FRONTEND}:latest
                """
            }
        }
    }

    post {
        failure {
            withCredentials([
                string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                string(credentialsId: "${TELEGRAM_CHAT_ID}", variable: 'CHAT_ID')
            ]) {
                sh '''
                MESSAGE="🚨 *ALERTE SÉCURITÉ JENKINS* 🚨%0A%0A"
                MESSAGE="${MESSAGE}*Projet :* ${JOB_NAME}%0A"
                MESSAGE="${MESSAGE}*Build :* #${BUILD_NUMBER}%0A"
                MESSAGE="${MESSAGE}*Statut :* ÉCHEC ❌%0A"
                MESSAGE="${MESSAGE}*Action :* Le pipeline a été stoppé. Vérifiez les logs de Trivy ou les erreurs de build.%0A%0A"
                MESSAGE="${MESSAGE}*Lien :* ${BUILD_URL}"

                curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                    -d "chat_id=${CHAT_ID}" \
                    -d "parse_mode=Markdown" \
                    -d "text=${MESSAGE}"
                '''
            }
        }
        
        always {
            echo "Nettoyage de l'environnement..."
            sh 'rm -f .env'
        }
    }
}
