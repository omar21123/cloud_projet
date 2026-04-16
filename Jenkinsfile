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
                echo "Attente du démarrage de l'application (15s)..."
                sleep 15
            }
        }

        stage('Security Scan — Container (Trivy)') {
            steps {
                echo '🔍 Scan profond de l image (Vulnerabilities & Secrets)...'
                script {
                    // On sort le résultat en JSON pour le traitement post-build
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
                    -u \$(id -u):\$(id -g) \
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
                    // On remplace les underscores par des tirets pour éviter l'erreur de parsing Markdown de Telegram
                    def safeApp = IMAGE_FRONTEND.replace("_", "-")
                    def trivyCount = "0"
                    
                    if (fileExists('trivy-report.json')) {
                        trivyCount = sh(script: "grep -o '\"Severity\":\"' trivy-report.json | wc -l", returnStdout: true).trim()
                    }

                    sh """
                    MESSAGE="✅ *PIPELINE RÉUSSI* %0A%0A"
                    MESSAGE="\${MESSAGE}*App:* ${safeApp}%0A"
                    MESSAGE="\${MESSAGE}*Trivy Alertes:* ${trivyCount} (H/C)%0A"
                    MESSAGE="\${MESSAGE}*DAST Report:* Généré"
                    
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
                script {
                    def safeJob = JOB_NAME.replace("_", "-")
                    sh """
                    MESSAGE="🚨 *ALERTE ÉCHEC SÉCURITÉ* %0A%0A"
                    MESSAGE="\${MESSAGE}*Job:* ${safeJob}%0A"
                    MESSAGE="\${MESSAGE}*Build:* #${BUILD_NUMBER}%0A"
                    MESSAGE="\${MESSAGE}*Action:* Vérifiez les logs Trivy/ZAP."

                    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                        -d "chat_id=${CHAT_ID}" \
                        -d "parse_mode=Markdown" \
                        -d "text=\${MESSAGE}"
                    """
                }
            }
        }

        always {
            echo "Nettoyage et archivage..."
            archiveArtifacts artifacts: 'zap-reports/zap_report.html, trivy-report.json', allowEmptyArchive: true
            sh 'rm -f .env'
        }
    }
}
