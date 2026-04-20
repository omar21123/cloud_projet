pipeline {
    agent any

    environment {
        COMPOSE_PROJECT   = "cloud_projet"
        COMPOSE_FILE      = "docker-compose.prod.yml"
        IMAGE_FRONTEND    = "cloud_projet-frontend"
        TRIVY_IMAGE       = "ghcr.io/aquasecurity/trivy:0.51.4"
        TELEGRAM_CREDS_ID = 'TELEGRAM_TOKEN_ID'
        TELEGRAM_CHAT_ID  = 'TELEGRAM_CHAT_ID'
    }

    stages {
        stage('Checkout') {
            steps {
                script { env.LAST_STAGE = 'Checkout' }
                checkout scm
                script {
                    env.GIT_BRANCH_NAME = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                }
            }
        }

        stage('Setup — Trivy') {
            steps {
                script { env.LAST_STAGE = 'Setup — Trivy' }
                sh '''
                    if ! docker image inspect ${TRIVY_IMAGE} > /dev/null 2>&1; then
                        docker pull ${TRIVY_IMAGE}
                    fi
                '''
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
                script { env.LAST_STAGE = 'Build & Deploy' }
                sh '''
                    echo "DB_ROOT_PASSWORD=${ENV_DB_ROOT_PASSWORD}" >  .env
                    echo "DB_PASSWORD=${ENV_DB_PASSWORD}"            >> .env
                    echo "CTFD_SECRET_KEY=${ENV_CTFD_SECRET_KEY}"     >> .env
                    echo "MARIADB_USER=${ENV_MARIADB_USER}"           >> .env
                    echo "MARIADB_DATABASE=${ENV_MARIADB_DATABASE}"  >> .env
                    echo "DATABASE_URL=${ENV_DATABASE_URL}"           >> .env
                    echo "REDIS_URL=${ENV_REDIS_URL}"                >> .env

                    docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} build --no-cache frontend
                    docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} up -d frontend
                '''
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                script {
                    env.LAST_STAGE = 'Security Scan'
                    
                    // 1. Scan et génération du JSON (on ne casse pas encore le build ici)
                    sh '''
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            -v "${WORKSPACE}":/workspace \
                            ${TRIVY_IMAGE} image \
                            --scanners vuln,secret \
                            --severity HIGH,CRITICAL \
                            --format json \
                            --output /workspace/trivy-report.json \
                            ${IMAGE_FRONTEND}:latest || true
                    '''

                    // 2. Script Python intégré pour extraire les infos
                    writeFile file: 'trivy-parser.py', text: """
import json, os
path = 'trivy-report.json'
crit, high, sec = 0, 0, 0
summary_lines = []

if os.path.exists(path):
    with open(path) as f:
        try:
            data = json.load(f)
            for res in data.get('Results', []):
                for v in res.get('Vulnerabilities', []):
                    if v['Severity'] == 'CRITICAL': crit += 1
                    else: high += 1
                    if len(summary_lines) < 5:
                        summary_lines.append(f"• {v['VulnerabilityID']} | {v['PkgName']} ({v.get('InstalledVersion','')})")
                sec += len(res.get('Secrets', []))
        except: pass

with open('trivy-summary.txt', 'w') as f:
    f.write(f"💣 CRITICAL: {crit}\\n⚠️ HIGH: {high}\\n🔑 SECRETS: {sec}\\n\\n")
    f.write("Top Vulnerabilities:\\n" + ("\\n".join(summary_lines) if summary_lines else "None"))
"""
                    sh 'python3 trivy-parser.py'

                    // 3. Affichage immédiat dans l'interface Jenkins
                    if (fileExists('trivy-summary.txt')) {
                        def report = readFile('trivy-summary.txt')
                        currentBuild.description = report.replace('\n', '<br>')
                    }

                    // 4. Blocage du build si failles trouvées
                    def summary = readFile('trivy-summary.txt')
                    if (summary.contains("CRITICAL: 0") == false || summary.contains("HIGH: 0") == false) {
                        error "❌ Sécurité compromise : Fails HIGH ou CRITICAL détectées."
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                def info = fileExists('trivy-summary.txt') ? "\n\n🛡️ *Sécurité :*\n" + readFile('trivy-summary.txt') : ""
                sendTelegramNotification("✅ *BUILD SUCCESS*", "Le déploiement est terminé.${info}")
            }
        }
        failure {
            script {
                def info = fileExists('trivy-summary.txt') ? "\n\n🛡️ *Détails Sécurité :*\n" + readFile('trivy-summary.txt') : ""
                sendTelegramNotification("🚨 *BUILD FAILED*", "Échec à l'étape : *${env.LAST_STAGE}*${info}")
            }
        }
        always {
            // Archive le rapport pour consultation ultérieure
            archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
            
            sh '''
                rm -f .env trivy-report.json trivy-summary.txt trivy-parser.py || true
                docker image prune -f || true
            '''
        }
    }
}

def sendTelegramNotification(status, body) {
    def branch = env.GIT_BRANCH_NAME ?: 'N/A'
    def message = """${status}
📦 *Projet :* `${env.JOB_NAME}`
🔢 *Build :* #${env.BUILD_NUMBER}
🌿 *Branche :* `${branch}`
${body}

🔗 [Consulter Jenkins](${env.BUILD_URL}console)"""

    withCredentials([
        string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
        string(credentialsId: "${TELEGRAM_CHAT_ID}",  variable: 'CHAT_ID')
    ]) {
        sh "curl -s -X POST https://api.telegram.org/bot${BOT_TOKEN}/sendMessage -d chat_id=${CHAT_ID} -d parse_mode=Markdown -d text='${message}'"
    }
}
