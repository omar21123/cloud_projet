pipeline {
    agent any

    environment {
        COMPOSE_PROJECT   = "cloud_projet"
        COMPOSE_FILE      = "docker-compose.prod.yml"
        IMAGE_FRONTEND    = "cloud_projet-frontend"
        TRIVY_IMAGE       = "ghcr.io/aquasecurity/trivy:latest"
        TELEGRAM_CREDS_ID = 'TELEGRAM_TOKEN_ID'
        TELEGRAM_CHAT_ID  = 'TELEGRAM_CHAT_ID'
    }

    stages {

        // ─────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────
        stage('Security Scan — Filesystem') {
            steps {
                echo '🔍 Scan secrets...'

                sh '''
                docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    ${TRIVY_IMAGE} image \
                    --scanners secret \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    ${IMAGE_FRONTEND}:latest
                '''
            }
        }

        // ─────────────────────────────
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

        // ─────────────────────────────
        stage('Security Scan — Container Image') {
            steps {
                script {
                    echo '🔍 Scan profond...'

                    // 1️⃣ Scan JSON (silencieux pour stats)
                    sh '''
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        ${TRIVY_IMAGE} image \
                        --scanners vuln,secret \
                        --severity HIGH,CRITICAL \
                        --format json \
                        --exit-code 0 \
                        ${IMAGE_FRONTEND}:latest > trivy-report.json 2>/dev/null || true
                    '''

                    // 2️⃣ Parser JSON
                    writeFile file: 'parser.py', text: '''
import json

critical = 0
high = 0
secrets = 0

try:
    with open("trivy-report.json") as f:
        data = json.load(f)

    for result in data.get("Results", []):
        for v in result.get("Vulnerabilities") or []:
            if v.get("Severity") == "CRITICAL":
                critical += 1
            elif v.get("Severity") == "HIGH":
                high += 1

        for s in result.get("Secrets") or []:
            secrets += 1

except:
    pass

with open("trivy-summary.env", "w") as f:
    f.write(f"CRITICAL={critical}\\n")
    f.write(f"HIGH={high}\\n")
    f.write(f"SECRETS={secrets}\\n")
'''

                    sh 'python3 parser.py'

                    // 3️⃣ Scan normal (affichage + fail)
                    sh '''
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        ${TRIVY_IMAGE} image \
                        --scanners vuln,secret \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        ${IMAGE_FRONTEND}:latest
                    '''
                }
            }
        }
    }

    // ─────────────────────────────
    post {
        failure {
            script {
                try {
                    def critical = "?"
                    def high     = "?"
                    def secrets  = "?"

                    if (fileExists('trivy-summary.env')) {
                        readFile('trivy-summary.env').split('\\n').each { line ->
                            def parts = line.split('=')
                            if (parts.size() == 2) {
                                if (parts[0] == 'CRITICAL') critical = parts[1]
                                if (parts[0] == 'HIGH')     high     = parts[1]
                                if (parts[0] == 'SECRETS')  secrets  = parts[1]
                            }
                        }
                    }

                    withCredentials([
                        string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                        string(credentialsId: "${TELEGRAM_CHAT_ID}", variable: 'CHAT_ID')
                    ]) {
                        sh """
                        MESSAGE="🚨 *ALERTE SÉCURITÉ JENKINS* 🚨%0A%0A\
*Projet :* ${JOB_NAME}%0A\
*Build :* #${BUILD_NUMBER}%0A\
*Statut :* ÉCHEC ❌%0A\
%0A🛡️ *Résultat Scan*%0A\
💣 Critical : ${critical}%0A\
⚠️ High     : ${high}%0A\
🔑 Secrets  : ${secrets}%0A\
%0A🔗 ${BUILD_URL}"

                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                            -d "chat_id=${CHAT_ID}" \
                            -d "parse_mode=Markdown" \
                            -d "text=\${MESSAGE}"
                        """
                    }

                } catch (Exception e) {
                    echo "Erreur lors de l'envoi Telegram : ${e.getMessage()}"
                }
            }
        }

        always {
            sh 'rm -f .env trivy-report.json trivy-summary.env parser.py'
        }
    }
}
