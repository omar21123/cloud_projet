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
                    env.GIT_BRANCH_NAME = env.BRANCH_NAME ?: sh(
                        script: 'git branch --show-current || git rev-parse --abbrev-ref HEAD || echo unknown',
                        returnStdout: true
                    ).trim()

                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
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
                script {
                    env.LAST_STAGE = 'Build & Deploy'

                    sh '''
                        echo "DB_ROOT_PASSWORD=${ENV_DB_ROOT_PASSWORD}" >  .env
                        echo "DB_PASSWORD=${ENV_DB_PASSWORD}"           >> .env
                        echo "CTFD_SECRET_KEY=${ENV_CTFD_SECRET_KEY}"   >> .env
                        echo "MARIADB_USER=${ENV_MARIADB_USER}"         >> .env
                        echo "MARIADB_DATABASE=${ENV_MARIADB_DATABASE}" >> .env
                        echo "DATABASE_URL=${ENV_DATABASE_URL}"         >> .env
                        echo "REDIS_URL=${ENV_REDIS_URL}"               >> .env
                    '''

                    def buildExit = sh(
                        script: '''
                            set +e
                            docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} build --no-cache frontend > build-deploy.log 2>&1
                            BUILD_RC=$?
                            if [ $BUILD_RC -eq 0 ]; then
                                docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} up -d frontend >> build-deploy.log 2>&1
                                BUILD_RC=$?
                            fi
                            exit $BUILD_RC
                        ''',
                        returnStatus: true
                    )

                    if (buildExit != 0) {
                        env.FAILURE_REASON = sh(
                            script: '''tail -n 30 build-deploy.log | tr '\n' ' ' ''',
                            returnStdout: true
                        ).trim()
                        error("❌ Build/Deploy failed.")
                    }
                }
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

                    def secretExit = sh(
                        script: '''
                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                ${TRIVY_IMAGE} image \
                                --scanners secret \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                --quiet \
                                ${IMAGE_FRONTEND}:latest
                        ''',
                        returnStatus: true
                    )

                    if (secretExit != 0) {
                        env.FAILURE_REASON = "Trivy secret scan found HIGH/CRITICAL secrets."
                        error("❌ Secret scan failed.")
                    }
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
                    '''

                    writeFile file: 'trivy-parser.py', text: '''#!/usr/bin/env python3
import json, sys, os

path = "trivy-vuln-report.json"
if not os.path.exists(path) or os.path.getsize(path) == 0:
    with open("trivy-summary.env", "w") as f:
        f.write("TRIVY_AVAILABLE=false\\n")
    with open("trivy-top-vulns.txt", "w") as f:
        f.write("No Trivy report generated")
    sys.exit(0)

with open(path) as f:
    try:
        data = json.load(f)
    except json.JSONDecodeError:
        with open("trivy-summary.env", "w") as f2:
            f2.write("TRIVY_AVAILABLE=false\\n")
        with open("trivy-top-vulns.txt", "w") as f2:
            f2.write("Trivy report unreadable")
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
            top_vulns.append(f"• {cve} | {pkg} {ver} -> fix: {fix}")

    for s in result.get("Secrets") or []:
        secrets += 1

with open("trivy-summary.env", "w") as f:
    f.write("TRIVY_AVAILABLE=true\\n")
    f.write(f"CRITICAL_COUNT={critical}\\n")
    f.write(f"HIGH_COUNT={high}\\n")
    f.write(f"SECRETS_FOUND={secrets}\\n")

with open("trivy-top-vulns.txt", "w") as f:
    f.write("\\n".join(top_vulns) if top_vulns else "None detected")
'''

                    sh '''
                        chmod +x trivy-parser.py
                        python3 trivy-parser.py
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
                        env.FAILURE_REASON = "Trivy found HIGH/CRITICAL vulnerabilities or secrets."
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
                def duration  = currentBuild.durationString?.replace(' and counting', '') ?: 'N/A'
                def branch    = env.GIT_BRANCH_NAME ?: 'N/A'
                def commitId  = env.GIT_COMMIT_SHORT ?: 'N/A'
                def reason    = env.FAILURE_REASON ?: 'No detailed failure reason captured.'

                def trivyAvailable = false
                def critical = null
                def high     = null
                def secrets  = null
                def topVulns = "Not available"

                try {
                    if (fileExists('trivy-summary.env')) {
                        readFile('trivy-summary.env').trim().split('\\n').each { line ->
                            def kv = line.split('=', 2)
                            if (kv.size() == 2) {
                                switch (kv[0].trim()) {
                                    case 'TRIVY_AVAILABLE': trivyAvailable = (kv[1].trim() == 'true'); break
                                    case 'CRITICAL_COUNT':  critical = kv[1].trim(); break
                                    case 'HIGH_COUNT':      high     = kv[1].trim(); break
                                    case 'SECRETS_FOUND':   secrets  = kv[1].trim(); break
                                }
                            }
                        }
                    }

                    if (fileExists('trivy-top-vulns.txt')) {
                        topVulns = readFile('trivy-top-vulns.txt').trim()
                        if (!topVulns) {
                            topVulns = "Not available"
                        }
                    }

                    def trivySection = trivyAvailable ? """
━━━━━━━━━━━━━━━━━━━━━
🛡️ *Résultats Trivy*
━━━━━━━━━━━━━━━━━━━━━
💣 CRITICAL : *${critical}*
⚠️ HIGH     : *${high}*
🔑 Secrets  : *${secrets}*

📋 *Top vulnérabilités :*
