pipeline {
    agent any

    environment {
        COMPOSE_PROJECT = "cloud_projet"
        COMPOSE_FILE    = "docker-compose.prod.yml"
        IMAGE_FRONTEND  = "cloud_projet-frontend"
        // On utilise l'image qui a fonctionné au pull manuel
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
                echo '🔍 Scan des sources avec l image GHCR...'
                sh """
                docker run --rm \
                    -v "\$(pwd)/frontend":/scan:ro \
                    ${TRIVY_IMAGE} fs \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    /scan
                """
            }
        }

        stage('Build & Deploy') {
            environment {
                // Utilise tes credentials Jenkins ici
                ENV_DB_ROOT_PASSWORD = credentials('DB_ROOT_PASSWORD')
                ENV_DB_PASSWORD      = credentials('DB_PASSWORD')
                ENV_CTFD_SECRET_KEY  = credentials('CTFD_SECRET_KEY')
                ENV_MARIADB_USER      = credentials('MARIADB_USER')
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
    }

    post {
        always {
            sh 'rm -f .env'
        }
    }
}
