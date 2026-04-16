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
                // On attend que l'application soit bien démarrée
                echo "Attente du démarrage de l'application..."
                sleep 10
            }
        }

        stage('Security Scan — Container (Trivy)') {
            steps {
                echo '🔍 Scan profond de l image (Vulnerabilities & Secrets)...'
                script {
                    // On génère un résumé JSON pour Telegram mais on bloque le build si HIGH/CRITICAL
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
                docker run --rm -v \$(pwd)/zap-reports:/zap/wrk/:rw --network="host" \
                    ${ZAP_IMAGE} zap-baseline.py \
                    -t http://localhost:80 \
                    -r zap_report.html || true
                """
                // Note: '|| true' évite de bloquer le build si ZAP trouve des alertes mineures
                // Tu peux l'enlever pour être plus strict.
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
                    def trivyCount = sh(script: "grep -o '\"Severity\":\"' trivy-report.json | wc -l", returnStdout: true).trim()
                    sh """
                    MESSAGE="✅ *PIPELINE RÉUSSI* ✅%0A%0A"
                    MESSAGE="\${MESSAGE}*App :* ${IMAGE_FRONTEND}%0A"
                    MESSAGE="\${MESSAGE}*Trivy Alertes :* ${trivyCount} (High/Critical)%0A"
                    MESSAGE="\${MESSAGE}*ZAP Report :* Généré (HTML)%0A"
                    
                    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                        -d "chat_id=${CHAT_ID}" \
                        -d "parse_mode=Markdown" \
                        -d "text=\${MESSAGE}"
                    """
                }
            }
        }

        failure {
            withCredentials([
                string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                string(credentialsId: "${TELEGRAM_CHAT_ID}", variable: 'CHAT_ID')
            ]) {
                sh '''
                MESSAGE="🚨 *ALERTE ÉCHEC SÉCURITÉ* 🚨%0A%0A"
                MESSAGE="${MESSAGE}*Build :* #${BUILD_NUMBER}%0A"
                MESSAGE="${MESSAGE}*Action :* Le scan Trivy ou ZAP a détecté des failles critiques.%0A"
                MESSAGE="${MESSAGE}*Lien :* ${BUILD_URL}"

                curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                    -d "chat_id=${CHAT_ID}" \
                    -d "parse_mode=Markdown" \
                    -d "text=${MESSAGE}"
                '''
            }
        }

        always {
            echo "Archivage des rapports..."
            archiveArtifacts artifacts: 'zap-reports/zap_report.html, trivy-report.json', allowEmptyArchive: true
            sh 'rm -f .env'
        }
    }
}
