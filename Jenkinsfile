*pipeline {
    agent any

    environment {
        COMPOSE_PROJECT   = "cloud_projet"
        COMPOSE_FILE      = "docker-compose.prod.yml"
        IMAGE_FRONTEND    = "cloud_projet-frontend"
        TRIVY_IMAGE       = "ghcr.io/aquasecurity/trivy:latest"
        ZAP_IMAGE         = "ghcr.io/zaproxy/zaproxy:stable"
        TELEGRAM_CREDS_ID = 'TELEGRAM_TOKEN_ID'
        TELEGRAM_CHAT_ID  = 'TELEGRAM_CHAT_ID'
        MY_EMAIL          = 'ton-email@gmail.com' // 📧 CHANGE CECI
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build & Deploy') {
            environment {
                DB_ROOT = credentials('DB_ROOT_PASSWORD')
                DB_PASS = credentials('DB_PASSWORD')
                CTFD_KEY = credentials('CTFD_SECRET_KEY')
                DB_USER = credentials('MARIADB_USER')
                DB_NAME = credentials('MARIADB_DATABASE')
                DB_URL = credentials('DATABASE_URL')
                REDIS_URL = credentials('REDIS_URL')
            }
            steps {
                sh '''
                echo "DB_ROOT_PASSWORD=${DB_ROOT}" > .env
                echo "DB_PASSWORD=${DB_PASS}" >> .env
                echo "CTFD_SECRET_KEY=${CTFD_KEY}" >> .env
                echo "MARIADB_USER=${DB_USER}" >> .env
                echo "MARIADB_DATABASE=${DB_NAME}" >> .env
                echo "DATABASE_URL=${DB_URL}" >> .env
                echo "REDIS_URL=${REDIS_URL}" >> .env

                docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} build --no-cache frontend
                docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} up -d frontend
                '''
                sleep 15
            }
        }

        stage('Security Scan — Container (Trivy)') {
            steps {
                echo '🔍 Scan profond de l image...'
                script {
                    // Suppression de --skip-db-update pour permettre l'initialisation
                    sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        ${TRIVY_IMAGE} image \
                        --severity HIGH,CRITICAL \
                        --format json --output trivy-report.json \
                        ${IMAGE_FRONTEND}:latest
                    """
                }
            }
        }

        stage('Security Scan — DAST (OWASP ZAP)') {
            steps {
                echo '🚀 Lancement du scan dynamique (DAST)...'
                sh """
                mkdir -p zap-reports
                chmod 777 zap-reports
                docker run --rm -v \$(pwd)/zap-reports:/zap/wrk/:rw --network="host" \
                    ${ZAP_IMAGE} zap-baseline.py \
                    -t http://localhost:80 \
                    -r zap_report.html || true
                """
            }
        }
    }

    post {
        success {
            withCredentials([
                string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                string(credentialsId: "${TELEGRAM_CHAT_ID}", variable: 'CHAT_ID')
            ]) {
                sh "curl -s -X POST https://api.telegram.org/bot${BOT_TOKEN}/sendMessage -d chat_id=${CHAT_ID} -d text='✅ Build #${BUILD_NUMBER} réussi !'"
            }
        }

        failure {
            script {
                // 1. Alert Telegram
                withCredentials([
                    string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                    string(credentialsId: "${TELEGRAM_CHAT_ID}", variable: 'CHAT_ID')
                ]) {
                    sh "curl -s -X POST https://api.telegram.org/bot${BOT_TOKEN}/sendMessage -d chat_id=${CHAT_ID} -d text='🚨 Échec Build #${BUILD_NUMBER}. Rapports envoyés par Email.'"
                }

                // 2. Envoi Email avec Rapports
                emailext (
                    to: "${MY_EMAIL}",
                    subject: "🚨 Rapport de Sécurité - Build #${BUILD_NUMBER}",
                    body: """Le pipeline a échoué.
                            Détails du build : ${BUILD_URL}
                            Consultez les fichiers joints pour les scans Trivy et ZAP.""",
                    attachmentsPattern: "trivy-report.json, zap-reports/zap_report.html"
                )
            }
        }

        always {
            archiveArtifacts artifacts: 'zap-reports/zap_report.html, trivy-report.json', allowEmptyArchive: true
            sh 'rm -f .env && docker image prune -f'
        }
    }
}
