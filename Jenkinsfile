pipeline {
    agent any
    environment {
        COMPOSE_PROJECT = "cloud_projet"
        COMPOSE_FILE    = "docker-compose.prod.yml"
        IMAGE_FRONTEND  = "cloud_projet-frontend"
        TRIVY_IMAGE     = "ghcr.io/aquasecurity/trivy:0.51.4"   // ← pin version, avoids re-pull on every run
        TELEGRAM_CREDS_ID = 'TELEGRAM_TOKEN_ID'
        TELEGRAM_CHAT_ID  = 'TELEGRAM_CHAT_ID'
    }
    stages {

        // ── 1. Checkout ────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ── 2. Cache Trivy image (pull only if not present) ────────────
        stage('Setup — Trivy Cache') {
            steps {
                sh '''
                    if ! docker image inspect ${TRIVY_IMAGE} > /dev/null 2>&1; then
                        echo "📥 Trivy image not found locally — pulling..."
                        docker pull ${TRIVY_IMAGE}
                    else
                        echo "✅ Trivy image already cached — skipping pull."
                    fi
                '''
            }
        }

        // ── 3. Secret scan on filesystem ──────────────────────────────
        stage('Security Scan — Secrets') {
            steps {
                sh '''
                    echo "🔍 Scanning for secrets..."
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        ${TRIVY_IMAGE} image \
                        --scanners secret \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        --format json \
                        ${IMAGE_FRONTEND}:latest > trivy-secret-report.json 2>/dev/null || true

                    # Human-readable output to console
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

        // ── 4. Build & Deploy ──────────────────────────────────────────
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

        // ── 5. Deep vuln scan — capture JSON for Telegram ─────────────
        stage('Security Scan — Container Image') {
            steps {
                script {
                    echo '🔍 Deep vulnerability scan...'

                    // ① Run scan, save JSON report (exit-code 0 so we parse first)
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

                    // ② Parse JSON → summary file (used by Telegram post step)
                    sh '''
                        python3 - <<'PYEOF'
import json, sys, os

report_path = "trivy-vuln-report.json"
if not os.path.exists(report_path):
    with open("trivy-summary.env","w") as f:
        f.write("CRITICAL_COUNT=0\nHIGH_COUNT=0\nTOP_VULNS=N/A\nSECRETS_FOUND=0\n")
    sys.exit(0)

with open(report_path) as f:
    data = json.load(f)

results   = data.get("Results", [])
critical  = high = secrets = 0
top_vulns = []

for r in results:
    # Vulnerabilities
    for v in r.get("Vulnerabilities") or []:
        sev = v.get("Severity","")
        if sev == "CRITICAL":
            critical += 1
        elif sev == "HIGH":
            high += 1
        if sev in ("CRITICAL","HIGH") and len(top_vulns) < 5:
            pkg     = v.get("PkgName","?")
            cve     = v.get("VulnerabilityID","?")
            fix     = v.get("FixedVersion","no fix")
            top_vulns.append(f"{cve} [{pkg}] fix:{fix}")
    # Secrets
    for s in r.get("Secrets") or []:
        secrets += 1

with open("trivy-summary.env","w") as f:
    f.write(f"CRITICAL_COUNT={critical}\n")
    f.write(f"HIGH_COUNT={high}\n")
    f.write(f"TOP_VULNS={'\\n'.join(top_vulns) if top_vulns else 'None detected'}\n")
    f.write(f"SECRETS_FOUND={secrets}\n")
PYEOF
                    '''

                    // ③ Now enforce the exit code
                    def scanExit = sh(
                        script: """
                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                ${TRIVY_IMAGE} image \
                                --scanners vuln,secret \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                ${IMAGE_FRONTEND}:latest
                        """,
                        returnStatus: true
                    )
                    if (scanExit != 0) {
                        error("❌ Trivy found HIGH/CRITICAL vulnerabilities — blocking deployment.")
                    }
                }
            }
        }
    }

    post {
        failure {
            script {
                try {
                    // Read parsed summary (may not exist if failure was before scan stage)
                    def critical  = "N/A"
                    def high      = "N/A"
                    def topVulns  = "N/A"
                    def secrets   = "N/A"
                    def failStage = env.STAGE_NAME ?: "Unknown stage"

                    if (fileExists('trivy-summary.env')) {
                        def lines = readFile('trivy-summary.env').trim().split('\n')
                        lines.each { line ->
                            def parts = line.split('=', 2)
                            if (parts.size() == 2) {
                                switch (parts[0].trim()) {
                                    case 'CRITICAL_COUNT': critical = parts[1].trim(); break
                                    case 'HIGH_COUNT':     high     = parts[1].trim(); break
                                    case 'TOP_VULNS':      topVulns = parts[1].trim(); break
                                    case 'SECRETS_FOUND':  secrets  = parts[1].trim(); break
                                }
                            }
                        }
                    }

                    withCredentials([
                        string(credentialsId: "${TELEGRAM_CREDS_ID}", variable: 'BOT_TOKEN'),
                        string(credentialsId: "${TELEGRAM_CHAT_ID}",  variable: 'CHAT_ID')
                    ]) {
                        def message = """🚨 *ALERTE SÉCURITÉ — JENKINS* 🚨

📦 *Projet :* `${env.JOB_NAME}`
🔢 *Build :* \\#${env.BUILD_NUMBER}
❌ *Statut :* ÉCHEC
🔴 *Étape échouée :* ${failStage}

━━━━━━━━━━━━━━━━━━━━━
🛡️ *Résultats Trivy*
━━━━━━━━━━━━━━━━━━━━━
💣 CRITICAL : *${critical}*
⚠️ HIGH     : *${high}*
🔑 Secrets  : *${secrets}*

📋 *Top vulnérabilités :*
${topVulns}

🔗 [Voir les logs](${env.BUILD_URL}console)"""

                        sh """
                            curl -s -X POST "https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage" \\
                                --data-urlencode "chat_id=\${CHAT_ID}" \\
                                --data-urlencode "parse_mode=Markdown" \\
                                --data-urlencode "text=${message}" \\
                                --data-urlencode "disable_web_page_preview=true"
                        """
                    }
                } catch (Exception e) {
                    echo "⚠️ Erreur envoi Telegram : ${e.getMessage()}"
                }
            }
        }

        always {
            sh '''
                rm -f .env trivy-vuln-report.json trivy-secret-report.json trivy-summary.env
            '''
        }
    }
}
