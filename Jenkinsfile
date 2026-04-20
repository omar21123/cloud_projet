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
                    env.GIT_BRANCH_NAME = sh(
                        script: "git rev-parse --abbrev-ref HEAD",
                        returnStdout: true
                    ).trim()

                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Setup — Trivy Cache') {
            steps {
                script { env.LAST_STAGE = 'Setup — Trivy Cache' }
                sh '''
                    if docker image inspect ${TRIVY_IMAGE} > /dev/null 2>&1; then
                        echo "✅ Trivy already cached — skipping pull."
                    else
                        echo "📥 Pulling Trivy image..."
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
                    echo "DB_PASSWORD=${ENV_DB_PASSWORD}"           >> .env
                    echo "CTFD_SECRET_KEY=${ENV_CTFD_SECRET_KEY}"   >> .env
                    echo "MARIADB_USER=${ENV_MARIADB_USER}"         >> .env
                    echo "MARIADB_DATABASE=${ENV_MARIADB_DATABASE}" >> .env
                    echo "DATABASE_URL=${ENV_DATABASE_URL}"         >> .env
                    echo "REDIS_URL=${ENV_REDIS_URL}"               >> .env

                    docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} build --no-cache frontend
                    docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} up -d frontend
                '''
            }
        }

        stage('Security Scan — Secrets (pre-deploy)') {
            steps {
                script {
                    env.LAST_STAGE = 'Security Scan — Secrets (pre-deploy)'
                    echo '🔍 Scanning for hardcoded secrets...'

                    sh '''
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            -v "${WORKSPACE}":/workspace \
                            ${TRIVY_IMAGE} image \
                            --scanners secret \
                            --severity HIGH,CRITICAL \
                            --exit-code 0 \
                            --format json \
                            --output /workspace/trivy-secret-pre.json \
                            ${IMAGE_FRONTEND}:latest || true
                    '''

                    sh '''
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            ${TRIVY_IMAGE} image \
                            --scanners secret \
                            --severity HIGH,CRITICAL \
                            --exit-code 1 \
                            --quiet \
                            ${IMAGE_FRONTEND}:latest
                    '''
                }
            }
        }

        stage('Security Scan — Container Image') {
            steps {
                script {
                    env.LAST_STAGE = 'Security Scan — Container Image'
                    echo '🔍 Deep vulnerability + secret scan...'

                    sh '''
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            -v "${WORKSPACE}":/workspace \
                            ${TRIVY_IMAGE} image \
                            --scanners vuln,secret \
                            --severity HIGH,CRITICAL \
                            --exit-code 0 \
                            --format json \
                            --output /workspace/trivy-vuln-report.json \
                            ${IMAGE_FRONTEND}:latest || true

                        echo "=== JSON file size ==="
                        wc -c trivy-vuln-report.json || echo "File missing"
                        echo "=== First 200 chars ==="
                        head -c 200 trivy-vuln-report.json || true
                    '''

                    writeFile file: 'trivy-parser.py', text: '''#!/usr/bin/env python3
import json, sys, os

path = "trivy-vuln-report.json"
if not os.path.exists(path) or os.path.getsize(path) == 0:
    with open("trivy-summary.env", "w") as f:
        f.write("CRITICAL_COUNT=N/A\\nHIGH_COUNT=N/A\\nSECRETS_FOUND=N/A\\n")
    with open("trivy-top-vulns.txt", "w") as f:
        f.write("  Report missing or empty")
    print("[Trivy Parser] Report missing or empty")
    sys.exit(0)

with open(path) as f:
    try:
        data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"[Trivy Parser] JSON parse error: {e}")
        with open("trivy-summary.env", "w") as f2:
            f2.write("CRITICAL_COUNT=N/A\\nHIGH_COUNT=N/A\\nSECRETS_FOUND=N/A\\n")
        with open("trivy-top-vulns.txt", "w") as f2:
            f2.write("  JSON parse error")
        sys.exit(0)

critical, high, secrets = 0, 0, 0
top_vulns = []

for result in data.get("Results", []):
    for v in result.get("Vulnerabilities") or []:
        sev = v.get("Severity", "")
        if sev == "CRITICAL":
            critical += 1
        elif sev == "HIGH":
            high += 1

        if sev in ("CRITICAL", "HIGH") and len(top_vulns) < 5:
            cve = v.get("VulnerabilityID", "?")
            pkg = v.get("PkgName", "?")
            ver = v.get("InstalledVersion", "?")
            fix = v.get("FixedVersion", "no fix available")
            top_vulns.append(f"  • {cve} | {pkg} {ver} → fix: {fix}")

    for s in result.get("Secrets") or []:
        secrets += 1

with open("trivy-summary.env", "w") as f:
    f.write(f"CRITICAL_COUNT={critical}\\n")
    f.write(f"HIGH_COUNT={high}\\n")
    f.write(f"SECRETS_FOUND={secrets}\\n")

with open("trivy-top-vulns.txt", "w") as f:
    f.write("\\n".join(top_vulns) if top_vulns else "  None detected")

print(f"[Trivy Parser] CRITICAL={critical} HIGH={high} SECRETS={secrets}")
'''

                    sh '''
                        chmod +x trivy-parser.py
                        python3 trivy-parser.py
                        echo "=== trivy-summary.env ==="
                        cat trivy-summary.env || echo "No summary file"
                        echo "=== trivy-top-vulns.txt ==="
                        cat trivy-top-vulns.txt || echo "No vulns file"
                    '''

                    def scanExit = sh(
                        script: '''
                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                ${TRIVY_IMAGE} image \
                                --scanners vuln,secret \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                --quiet \
                                ${IMAGE_FRONTEND}:latest
                        ''',
                        returnStatus: true
                    )

                    if (scanExit != 0) {
                        error("❌ Trivy found HIGH/CRITICAL issues — deployment blocked.")
                    }
                }
            }
        }
    }

    post {
        failure {
            script {
                def failStage = env.LAST_STAGE ?: 'Unknown'
                def critical = 'N/A'
                def high     = 'N/A'
                def secrets  = 'N/A'
                def topVulns = '  None detected'
                def duration = currentBuild.durationString?.replace(' and counting', '') ?: 'N/A'
                def branch   = env.GIT_BRANCH_NAME ?: (env.BRANCH_NAME ?: 'N/A')
                def commitId = env.GIT_COMMIT_SHORT ?: 'N/A'

                try {
                    if (fileExists('trivy-summary.env')) {
                        readFile('trivy-summary.env').trim().split('\\n').each { line ->
                            def kv = line.split('=', 2)
                            if (kv.size() == 2) {
                                switch (kv[0].trim()) {
                                    case 'CRITICAL_COUNT': critical = kv[1].trim(); break
                                    case 'HIGH_COUNT':     high     = kv[1].trim(); break
                                    case 'SECRETS_FOUND':  secrets  = kv[1].trim(); break
                                }
                            }
                        }
                    }

                    if (fileExists('trivy-top-vulns.txt')) {
                        topVulns = readFile('trivy-top-vulns.txt').trim()
                        if (!topVulns) {
                            topVulns = '  None detected'
                        }
                    }

                    def tripleBacktick = '```'
                    def msg = """🚨 *ALERTE JENKINS — BUILD FAILED*

📦 *Projet :* `${env.JOB_NAME}`
🔢 *Build :* #${env.BUILD_NUMBER}
❌ *Statut :* ÉCHEC
🔴 *Étape :* ${failStage}
🌿 *Branch :* `${branch}`
🧾 *Commit :* `${commitId}`
⏱️ *Durée :* ${duration}

━━━━━━━━━━━━━━━━━━━━━
🛡️ *Résultats Trivy*
━━━━━━━━━━━━━━━━━━━━━
💣 CRITICAL : *${critical}*
⚠️ HIGH     : *${high}*
🔑 Secrets  : *${secrets}*

📋 *Top vulnérabilités :*
${tripleBacktick}
${topVulns}
${tripleBacktick}

🔗 [Voir les logs complets](${env.BUILD_URL}console)"""

                    withCredentials([
                        string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                        string(credentialsId: "${TELEGRAM_CHAT_ID}",  variable: 'CHAT_ID')
                    ]) {
                        writeFile file: 'telegram-msg-failure.txt', text: msg
                        sh '''
                            curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                                --data-urlencode "chat_id=${CHAT_ID}" \
                                --data-urlencode "parse_mode=Markdown" \
                                --data-urlencode "disable_web_page_preview=true" \
                                --data-urlencode "text@./telegram-msg-failure.txt" || echo "Telegram send failed"
                        '''
                    }

                    echo "✅ Telegram failure notification sent"
                } catch (Exception e) {
                    echo "⚠️ Telegram failure send error: ${e.getMessage()}"
                }
            }
        }

        success {
            script {
                def critical = 'N/A'
                def high     = 'N/A'
                def secrets  = 'N/A'
                def duration = currentBuild.durationString?.replace(' and counting', '') ?: 'N/A'
                def branch   = env.GIT_BRANCH_NAME ?: (env.BRANCH_NAME ?: 'N/A')
                def commitId = env.GIT_COMMIT_SHORT ?: 'N/A'

                try {
                    if (fileExists('trivy-summary.env')) {
                        readFile('trivy-summary.env').trim().split('\\n').each { line ->
                            def kv = line.split('=', 2)
                            if (kv.size() == 2) {
                                switch (kv[0].trim()) {
                                    case 'CRITICAL_COUNT': critical = kv[1].trim(); break
                                    case 'HIGH_COUNT':     high     = kv[1].trim(); break
                                    case 'SECRETS_FOUND':  secrets  = kv[1].trim(); break
                                }
                            }
                        }
                    }

                    def msg = """✅ *JENKINS BUILD SUCCESS*

📦 *Projet :* `${env.JOB_NAME}`
🔢 *Build :* #${env.BUILD_NUMBER}
🟢 *Statut :* SUCCÈS
🌿 *Branch :* `${branch}`
🧾 *Commit :* `${commitId}`
⏱️ *Durée :* ${duration}

━━━━━━━━━━━━━━━━━━━━━
🛡️ *Résultats Trivy réels*
━━━━━━━━━━━━━━━━━━━━━
💣 CRITICAL : *${critical}*
⚠️ HIGH     : *${high}*
🔑 Secrets  : *${secrets}*

🔗 [Voir les logs complets](${env.BUILD_URL}console)"""

                    withCredentials([
                        string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                        string(credentialsId: "${TELEGRAM_CHAT_ID}",  variable: 'CHAT_ID')
                    ]) {
                        writeFile file: 'telegram-msg-success.txt', text: msg
                        sh '''
                            curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                                --data-urlencode "chat_id=${CHAT_ID}" \
                                --data-urlencode "parse_mode=Markdown" \
                                --data-urlencode "disable_web_page_preview=true" \
                                --data-urlencode "text@./telegram-msg-success.txt" || echo "Telegram send failed"
                        '''
                    }

                    echo "✅ Telegram success notification sent"
                } catch (Exception e) {
                    echo "⚠️ Telegram success send error: ${e.getMessage()}"
                }
            }
        }

        always {
            sh '''
                rm -f .env \
                      trivy-vuln-report.json \
                      trivy-secret-pre.json \
                      trivy-summary.env \
                      trivy-top-vulns.txt \
                      trivy-parser.py \
                      telegram-msg-failure.txt \
                      telegram-msg-success.txt || true

                docker image prune -f || true
            '''
        }
    }
}
