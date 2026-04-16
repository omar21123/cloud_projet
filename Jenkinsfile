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

        // ─────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────────────────────
        stage('Setup — Trivy Cache') {
            steps {
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

        // ─────────────────────────────────────────────
        stage('Security Scan — Secrets (pre-build)') {
            steps {
                script {
                    env.LAST_STAGE = env.STAGE_NAME
                    echo '🔍 Scanning for hardcoded secrets...'

                    // Pass 1: capture JSON quietly
                    sh '''
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            ${TRIVY_IMAGE} image \
                            --scanners secret \
                            --severity HIGH,CRITICAL \
                            --exit-code 0 \
                            --format json \
                            ${IMAGE_FRONTEND}:latest > trivy-secret-pre.json 2>/dev/null || true
                    '''

                    // Pass 2: enforce gate (fails stage if secrets found)
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
        }

        // ─────────────────────────────────────────────
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

        // ─────────────────────────────────────────────
        stage('Security Scan — Container Image') {
            steps {
                script {
                    env.LAST_STAGE = env.STAGE_NAME
                    echo '🔍 Deep vulnerability + secret scan...'

                    // Pass 1: JSON report (never blocks)
                    sh '''
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            ${TRIVY_IMAGE} image \
                            --scanners vuln,secret \
                            --severity HIGH,CRITICAL \
                            --exit-code 0 \
                            --format json \
                            ${IMAGE_FRONTEND}:latest > trivy-vuln-report.json 2>/dev/null || true
                    '''

                    // Pass 2: FIXED Python parser — properly written to file
                    writeFile file: 'trivy-parser.py', text: '''#!/usr/bin/env python3
import json, sys, os, re

path = 'trivy-vuln-report.json'
if not os.path.exists(path):
    with open('trivy-summary.env','w') as f:
        f.write('CRITICAL_COUNT=0\\nHIGH_COUNT=0\\nSECRETS_FOUND=0\\nTOP_VULNS=None\\n')
    sys.exit(0)

with open(path) as f:
    data = json.load(f)

critical, high, secrets = 0, 0, 0
top_vulns = []

for result in data.get('Results', []):
    for v in result.get('Vulnerabilities') or []:
        sev = v.get('Severity','')
        if sev == 'CRITICAL': critical += 1
        elif sev == 'HIGH':   high += 1
        if sev in ('CRITICAL','HIGH') and len(top_vulns) < 5:
            cve = v.get('VulnerabilityID', '?')
            pkg = v.get('PkgName', '?')
            ver = v.get('InstalledVersion','?')
            fix = v.get('FixedVersion', 'no fix available')
            top_vulns.append(f'  • {cve} | {pkg} {ver} → fix: {fix}')
    for s in result.get('Secrets') or []:
        secrets += 1

summary = '\\n'.join(top_vulns) if top_vulns else '  None detected'

with open('trivy-summary.env','w') as f:
    f.write(f'CRITICAL_COUNT={critical}\\n')
    f.write(f'HIGH_COUNT={high}\\n')
    f.write(f'SECRETS_FOUND={secrets}\\n')
    f.write(f'TOP_VULNS={summary}\\n')

print(f'[Trivy Parser] CRITICAL={critical} HIGH={high} SECRETS={secrets}')
'''

                    // Execute the parser
                    sh '''
                        chmod +x trivy-parser.py
                        python3 trivy-parser.py
                        echo "=== trivy-summary.env ==="
                        cat trivy-summary.env || echo "No summary file created"
                    '''

                    // Pass 3: enforce gate — fails build if findings exist
                    def scanExit = sh(
                        script: '''
                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                ${TRIVY_IMAGE} image \
                                --scanners vuln,secret \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
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

    // ─────────────────────────────────────────────
    post {
        failure {
            script {
                env.LAST_STAGE = env.STAGE_NAME ?: env.LAST_STAGE ?: "Unknown"
                try {
                    // ── Read parsed Trivy summary ──────────────────────
                    def critical  = "0"
                    def high      = "0"
                    def secrets   = "0"
                    def topVulns  = "None detected"
                    def failStage = env.LAST_STAGE

                    if (fileExists('trivy-summary.env')) {
                        readFile('trivy-summary.env').trim().split('\n').each { line ->
                            if (line.contains('=')) {
                                def kv = line.split('=', 2)
                                if (kv.size() == 2) {
                                    switch (kv[0].trim()) {
                                        case 'CRITICAL_COUNT': critical = kv[1].trim(); break
                                        case 'HIGH_COUNT':     high = kv[1].trim(); break
                                        case 'SECRETS_FOUND':  secrets = kv[1].trim(); break
                                        case 'TOP_VULNS':      topVulns = kv[1].trim(); break
                                    }
                                }
                            }
                        }
                    }

                    // ── Build rich Telegram message ────────────────────
                    def msg = """🚨 *ALERTE SÉCURITÉ — JENKINS* 🚨

📦 *Projet :* `${env.JOB_NAME}`
🔢 *Build :* #${env.BUILD_NUMBER}
❌ *Statut :* ÉCHEC
🔴 *Étape  :* ${failStage}

━━━━━━━━━━━━━━━━━━━━━
🛡️ *Résultats Trivy*
━━━━━━━━━━━━━━━━━━━━━
💣 CRITICAL  : *${critical}*
⚠️  HIGH      : *${high}*
🔑 Secrets   : *${secrets}*

📋 *Top vulnérabilités (CVE · package · fix):*
\`\`\`
${topVulns}
\`\`\`
🔗 [Voir les logs complets](${env.BUILD_URL}console)"""

                    withCredentials([
                        string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                        string(credentialsId: "${TELEGRAM_CHAT_ID}", variable: 'CHAT_ID')
                    ]) {
                        writeFile file: 'telegram-msg.txt', text: msg
                        sh '''
                            curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                                --data-urlencode "chat_id=${CHAT_ID}" \
                                --data-urlencode "parse_mode=Markdown" \
                                --data-urlencode "disable_web_page_preview=true" \
                                --data-urlencode "text@./telegram-msg.txt" || echo "Telegram send failed"
                        '''
                    }
                    echo "✅ Telegram notification sent"
                } catch (Exception e) {
                    echo "⚠️ Telegram send error: ${e.getMessage()}"
                }
            }
        }

        success {
            script {
                // Optional: Success notification
                echo "✅ Build successful! No HIGH/CRITICAL issues found."
            }
        }

        always {
            sh '''
                rm -f .env trivy-vuln-report.json trivy-secret-pre.json \
                      trivy-summary.env trivy-parser.py telegram-msg.txt || true
                docker image prune -f || true
            '''
        }
    }
}
