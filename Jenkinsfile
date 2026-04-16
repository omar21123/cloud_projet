pipeline {
    agent any

    environment {
        COMPOSE_PROJECT   = "cloud_projet"
        COMPOSE_FILE      = "docker-compose.prod.yml"
        IMAGE_FRONTEND    = "cloud_projet-frontend"
        TRIVY_IMAGE       = "ghcr.io/aquasecurity/trivy:latest"
        ZAP_IMAGE         = "ghcr.io/zaproxy/zaproxy:stable"
        TELEGRAM_CREDS_ID = 'TELEGRAM_TOKEN_ID'
        TELEGRAM_CHAT_ID  = 'TELEGRAM_CHAT_ID'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
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
                echo "Attente du démarrage de l'application (15s)..."
                sleep 15
            }
        }

        stage('Security Scan — Container (Trivy)') {
            steps {
                echo '🔍 Scan profond de l image (Vulnerabilities & Secrets)...'
                script {
                    // Suppression de --skip-db-update pour assurer le premier run réussi
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
                script {
                    // Extraction des stats de sécurité
                    def criticals = sh(script: "grep -o '\"Severity\":\"CRITICAL\"' trivy-report.json | wc -l || echo 0", returnStdout: true).trim()
                    def highs = sh(script: "grep -o '\"Severity\":\"HIGH\"' trivy-report.json | wc -l || echo 0", returnStdout: true).trim()
                    
                    def message = """
🚀 *DEPLOYMENT SUCCESSFUL* 🚀
━━━━━━━━━━━━━━━━━━━━
📦 *Projet:* `${COMPOSE_PROJECT}`
🏗️ *Build:* #${BUILD_NUMBER}
🌐 *Application:* `${IMAGE_FRONTEND}`

🛡️ *SECURITY SUMMARY (Trivy)*
🛑 *Critical:* ${criticals}
⚠️ *High:* ${highs}

✅ *Status:* Application déployée et fonctionnelle.
🔗 *Console:* [Voir sur Jenkins](${env.BUILD_URL})
━━━━━━━━━━━━━━━━━━━━
"""
                    sh "curl -s -X POST 'https://api.telegram.org/bot${BOT_TOKEN}/sendMessage' -d 'chat_id=${CHAT_ID}' -d 'parse_mode=Markdown' -d 'text=${message}'"
                }
            }
        }

        failure {
            withCredentials([
                string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                string(credentialsId: "${TELEGRAM_CHAT_ID}", variable: 'CHAT_ID')
            ]) {
                script {
                    def message = """
🚨 *PIPELINE FAILED* 🚨
━━━━━━━━━━━━━━━━━━━━
❌ *Build:* #${BUILD_NUMBER}
🛑 *Projet:* `${COMPOSE_PROJECT}`
⚠️ *Alerte:* Le déploiement ou les scans ont échoué.

ℹ️ *Action Requise:* Vérifiez les rapports ci-joints ou les logs Jenkins.
🔗 *Logs:* [Accéder au build](${env.BUILD_URL})
━━━━━━━━━━━━━━━━━━━━
"""
                    // 1. Message d'alerte
                    sh "curl -s -X POST 'https://api.telegram.org/bot${BOT_TOKEN}/sendMessage' -d 'chat_id=${CHAT_ID}' -d 'parse_mode=Markdown' -d 'text=${message}'"

                    // 2. Envoi des rapports si disponibles
                    sh """
                    if [ -f trivy-report.json ]; then
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@trivy-report.json" -F "caption=📄 Rapport Trivy (JSON)"
                    fi
                    if [ -f zap-reports/zap_report.html ]; then
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@zap-reports/zap_report.html" -F "caption=🛡️ Rapport OWASP ZAP (HTML)"
                    fi
                    """
                }
            }
        }

        always {
            echo "Nettoyage et Archivage..."
            archiveArtifacts artifacts: 'zap-reports/zap_report.html, trivy-report.json', allowEmptyArchive: true
            sh 'rm -f .env && docker image prune -f'
        }
    }
}
