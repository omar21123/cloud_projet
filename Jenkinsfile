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

        stage('Setup — Trivy Cache') {
            steps {
                script { env.LAST_STAGE = 'Setup — Trivy Cache' }
                sh '''
                    if docker image inspect ${TRIVY_IMAGE} > /dev/null 2>&1; then
                        echo "✅ Trivy already cached"
                    else
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

        stage('Security Scan') {
            steps {
                script {
                    env.LAST_STAGE = 'Security Scan'
                    
                    // 1. Génération du rapport JSON
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

                    // 2. Création du script de parsing
                    writeFile file: 'trivy-parser.py', text: """
import json, os
path = 'trivy-report.json'
if os.path.exists(path):
    with open(path) as f:
        data = json.load(f)
    crit, high, sec = 0, 0, 0
    summary = []
    for res in data.get('Results', []):
        for v in res.get('Vulnerabilities', []):
            if v['Severity'] == 'CRITICAL': crit += 1
            else: high += 1
            if len(summary) < 5:
                summary.append(f"• {v['VulnerabilityID']} ({v['PkgName']})")
        sec += len(res.get('Secrets', []))
    
    with open('trivy-summary.txt', 'w') as f:
        f.write(f"CRITICAL={crit}\\nHIGH={high}\\nSECRETS={sec}\\n")
        f.write("\\n".join(summary))
"""
                    sh 'python3 trivy-parser.py'

                    // 3. AFFICHAGE DANS L'INTERFACE JENKINS
                    if (fileExists('trivy-summary.txt')) {
                        def reportContent = readFile('trivy-summary.txt')
                        currentBuild.description = "🛡️ **Sécurité :**\n${reportContent}"
                    }

                    // 4. Bloquer le déploiement si vulnérabilités trouvées
                    def scanStatus = sh(script: "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock ${TRIVY_IMAGE} image --severity HIGH,CRITICAL --exit-code 1 --quiet ${IMAGE_FRONTEND}:latest", returnStatus: true)
                    
                    if (scanStatus != 0) {
                        error "❌ Trivy a détecté des failles critiques. Build stoppé."
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                sendTelegramNotification("✅ *SUCCESS*", "Build #${env.BUILD_NUMBER} réussi !")
            }
        }
        failure {
            script {
                sendTelegramNotification("🚨 *FAILED*", "Échec à l'étape : ${env.LAST_STAGE}")
            }
        }
        always {
            // ARCHIVAGE : Rend le fichier téléchargeable sur la page du build
            archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
            
            sh '''
                rm -f .env trivy-report.json trivy-summary.txt trivy-parser.py || true
                docker image prune -f || true
            '''
        }
    }
}

// Fonction pour éviter la duplication de code pour Telegram
def sendTelegramNotification(status, extra) {
    def branch = env.GIT_BRANCH_NAME ?: 'N/A'
    def msg = """${status}
📦 *Projet :* `${env.JOB_NAME}`
🌿 *Branche :* `${branch}`
${extra}
🔗 [Logs](${env.BUILD_URL}console)"""

    withCredentials([
        string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
        string(credentialsId: "${TELEGRAM_CHAT_ID}",  variable: 'CHAT_ID')
    ]) {
        sh "curl -s -X POST https://api.telegram.org/bot${BOT_TOKEN}/sendMessage -d chat_id=${CHAT_ID} -d parse_mode=Markdown -d text='${msg}'"
    }
}
