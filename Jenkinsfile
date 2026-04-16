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
                script {
                    // On lance le scan. On ne met pas de "|| true" ici car on veut le JSON même si ça échoue
                    sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        ${TRIVY_IMAGE} image \
                        --severity HIGH,CRITICAL \
                        --format json --output trivy-report.json \
                        ${IMAGE_FRONTEND}:latest || true
                    """
                }
            }
        }

        stage('Security Scan — DAST (OWASP ZAP)') {
            steps {
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
                    // Extraction précise des vulnérabilités
                    def criticals = sh(script: "grep -o '\"Severity\":\"CRITICAL\"' trivy-report.json | wc -l || echo 0", returnStdout: true).trim()
                    def highs = sh(script: "grep -o '\"Severity\":\"HIGH\"' trivy-report.json | wc -l || echo 0", returnStdout: true).trim()
                    
                    def message = """
🚀 *DEPLOYMENT SUCCESSFUL* 🚀
━━━━━━━━━━━━━━━━━━━━
📦 *Projet:* `${COMPOSE_PROJECT}`
🏗️ *Build:* #${BUILD_NUMBER}
🌐 *Application:* `${IMAGE_FRONTEND}`

🛡️ *SECURITY STATUS (Trivy)*
🛑 *Critical:* ${criticals}
⚠️ *High:* ${highs}

✅ *Status:* Déploiement actif sur le port 80.
🔗 *Console:* [Accéder au Build](${env.BUILD_URL})
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
⚠️ *Alerte:* Échec critique durant le build ou les scans.

ℹ️ *Action:* Consultez les rapports ci-dessous pour corriger les failles.
🔗 *Logs:* [Détails Jenkins](${env.BUILD_URL})
━━━━━━━━━━━━━━━━━━━━
"""
                    // 1. Envoyer le texte
                    sh "curl -s -X POST 'https://api.telegram.org/bot${BOT_TOKEN}/sendMessage' -d 'chat_id=${CHAT_ID}' -d 'parse_mode=Markdown' -d 'text=${message}'"

                    // 2. Envoyer les documents si existants
                    sh """
                    if [ -f trivy-report.json ]; then
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@trivy-report.json" -F "caption=📄 Rapport Trivy"
                    fi
                    if [ -f zap-reports/zap_report.html ]; then
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@zap-reports/zap_report.html" -F "caption=🛡️ Rapport OWASP ZAP"
                    fi
                    """
                }
            }
        }

        always {
            archiveArtifacts artifacts: 'zap-reports/zap_report.html, trivy-report.json', allowEmptyArchive: true
            sh 'rm -f .env && docker image prune -f'
        }
    }
}
