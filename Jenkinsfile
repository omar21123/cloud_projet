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
                // Récupération sécurisée des credentials Jenkins
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
                    // On ajoute --skip-java-db-update pour économiser l'espace disque (850Mo)
                    sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        ${TRIVY_IMAGE} image \
                        --skip-db-update \
                        --skip-java-db-update \
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
                # chmod pour s'assurer que Jenkins peut lire le rapport généré par le container ZAP
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
                    def trivyCount = sh(script: "grep -o '\"Severity\":\"' trivy-report.json | wc -l || echo 0", returnStdout: true).trim()
                    sh """
                    MESSAGE="✅ *PIPELINE RÉUSSI* ✅%0A%0A*App :* ${IMAGE_FRONTEND}%0A*Trivy Alertes :* ${trivyCount} (High/Critical)%0A*Statut :* Déploiement actif sur le port 80."
                    
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
                    // 1. Envoi du message texte d'alerte
                    sh """
                    MESSAGE="🚨 *ALERTE ÉCHEC SÉCURITÉ* 🚨%0A%0A*Build :* #${BUILD_NUMBER}%0A*Action :* Le pipeline a échoué. Vérifiez les rapports ci-joints."
                    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                        -d "chat_id=${CHAT_ID}" \
                        -d "parse_mode=Markdown" \
                        -d "text=\${MESSAGE}"
                    """

                    // 2. Envoi du rapport Trivy (Vérification si le fichier existe)
                    sh """
                    if [ -f trivy-report.json ]; then
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" \
                            -F "chat_id=${CHAT_ID}" \
                            -F "document=@trivy-report.json" \
                            -F "caption=📄 Rapport Trivy (JSON)"
                    fi
                    """

                    // 3. Envoi du rapport OWASP ZAP (HTML - Interactif et visuel)
                    sh """
                    if [ -f zap-reports/zap_report.html ]; then
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" \
                            -F "chat_id=${CHAT_ID}" \
                            -F "document=@zap-reports/zap_report.html" \
                            -F "caption=🛡️ Rapport OWASP ZAP (DAST)"
                    fi
                    """
                }
            }
        }

        always {
            echo "Nettoyage et Archivage..."
            // Archivage dans Jenkins pour garder une trace historique
            archiveArtifacts artifacts: 'zap-reports/zap_report.html, trivy-report.json', allowEmptyArchive: true
            
            // Nettoyage disque indispensable sur ton EC2
            sh '''
            rm -f .env
            docker image prune -f
            '''
        }
    }
}
