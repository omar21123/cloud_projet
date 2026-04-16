pipeline {
    agent any

    environment {
        // Définition des tags et noms de projet
        IMAGE_NAME = "cloud_projet-frontend"
        COMPOSE_PROJECT = "cloud_projet"
        TELEGRAM_CREDS_ID = "telegram_bot_token" // ID dans Jenkins Credentials
        TELEGRAM_CHAT_ID = "telegram_chat_id"   // ID dans Jenkins Credentials
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy') {
            steps {
                // Utilisation des credentials pour le fichier .env
                withCredentials([
                    string(credentialsId: 'DB_ROOT_PASSWORD', variable: 'DB_ROOT'),
                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASS'),
                    string(credentialsId: 'CTFD_SECRET_KEY', variable: 'CTFD_KEY'),
                    string(credentialsId: 'MARIADB_USER', variable: 'DB_USER'),
                    string(credentialsId: 'MARIADB_DATABASE', variable: 'DB_NAME'),
                    string(credentialsId: 'DATABASE_URL', variable: 'DB_URL'),
                    string(credentialsId: 'REDIS_URL', variable: 'REDIS_URL')
                ]) {
                    sh """
                    echo "DB_ROOT_PASSWORD=${DB_ROOT}" > .env
                    echo "DB_PASSWORD=${DB_PASS}" >> .env
                    echo "CTFD_SECRET_KEY=${DB_PASS}" >> .env
                    echo "MARIADB_USER=${DB_USER}" >> .env
                    echo "MARIADB_DATABASE=${DB_NAME}" >> .env
                    echo "DATABASE_URL=${DB_URL}" >> .env
                    echo "REDIS_URL=${REDIS_URL}" >> .env
                    
                    # Build sans cache pour garantir la fraîcheur
                    docker compose -p ${COMPOSE_PROJECT} -f docker-compose.prod.yml build --no-cache frontend
                    
                    # Déploiement
                    docker compose -p ${COMPOSE_PROJECT} -f docker-compose.prod.yml up -d frontend
                    """
                }
                sleep 5 // Laisser le temps au conteneur de se stabiliser
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                script {
                    // On scanne l'OS ET les bibliothèques (npm) avec --vuln-type os,library
                    // On ignore les erreurs pour ne pas bloquer le pipeline si des vulns existent
                    sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                    ghcr.io/aquasecurity/trivy:latest image \
                    --severity HIGH,CRITICAL \
                    --vuln-type os,library \
                    --format json \
                    --output trivy-report.json \
                    ${IMAGE_NAME}:latest
                    """
                }
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
                    // Extraction des résultats pour le message
                    def criticals = sh(script: "grep -o '\"Severity\":\"CRITICAL\"' trivy-report.json | wc -l || echo 0", returnStdout: true).trim()
                    def highs = sh(script: "grep -o '\"Severity\":\"HIGH\"' trivy-report.json | wc -l || echo 0", returnStdout: true).trim()
                    def cveList = sh(script: "grep -oE 'CVE-[0-9]{4}-[0-9]+' trivy-report.json | sort | uniq | head -n 5 | tr '\\n' ' ' || echo 'Aucune'", returnStdout: true).trim()

                    def message = """
✅ *PIPELINE RÉUSSI*
━━━━━━━━━━━━━━━━━━━━
📦 *Projet:* `${COMPOSE_PROJECT}`
🏗️ *Build:* #${BUILD_NUMBER}

🛡️ *RÉSUMÉ SÉCURITÉ*
🛑 *Critiques:* ${criticals}
⚠️ *Hautes:* ${highs}
🔍 *Détails:* `${cveList}`

🚀 *Status:* Front-end déployé avec succès.
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
                sh """
                curl -s -X POST 'https://api.telegram.org/bot${BOT_TOKEN}/sendMessage' \
                -d 'chat_id=${CHAT_ID}' \
                -d 'text=❌ ÉCHEC DU PIPELINE #${BUILD_NUMBER} pour ${COMPOSE_PROJECT}'
                """
            }
        }
    }
}
