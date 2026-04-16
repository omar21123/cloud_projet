pipeline {
    agent any

    environment {
        COMPOSE_PROJECT = "cloud_projet"
        COMPOSE_FILE    = "docker-compose.prod.yml"
        IMAGE_FRONTEND  = "cloud_projet-frontend"
        TRIVY_IMAGE     = "ghcr.io/aquasecurity/trivy:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Security Scan — Filesystem') {
            steps {
                echo '🔍 Scan profond des sources (Workspace complet)...'
                // -u 0 : permet à Trivy de lire les fichiers du workspace appartenant à l'utilisateur jenkins
                sh """
                docker run --rm \
                    -u 0 \
                    -v ${WORKSPACE}:/scan:ro \
                    ${TRIVY_IMAGE} fs \
                    --scanners vuln,secret \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    /scan
                """
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

                docker compose -p ${COMPOSE_PROJECT} -f ${COMPOSE_FILE} up -d --build frontend
                '''
            }
        }

	stage('Security Scan — Container Image') {
            steps {
                echo '🔍 Scan profond de l image (OS + Secrets)...'
                sh """
                docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    ${TRIVY_IMAGE} image \
                    --scanners vuln,secret \
                    --exit-code 1 \
                    --severity HIGH,CRITICAL \
                    ${IMAGE_FRONTEND}:latest
                """
            }
        }
    }

    post {
        always {
            sh 'rm -f .env'
        }
    }
}
