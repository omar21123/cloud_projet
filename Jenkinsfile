pipeline {
    agent any
    environment {
        DB_PASSWORD = credentials('db-password')
        CTFD_SECRET_KEY = credentials('ctfd-secret-key')
        DB_ROOT_PASSWORD = credentials('db-root-password')
        DEPLOY_DIR = '/home/ubuntu/cloud_projet'
    }
    options {
        skipDefaultCheckout(true)
    }
    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [
                        [$class: 'SubmoduleOption',
                         disableSubmodules: false,
                         parentCredentials: false,
                         recursiveSubmodules: true,
                         reference: '',
                         trackingSubmodules: false]
                    ],
                    userRemoteConfigs: [[url: 'https://github.com/Kimperi/CI-CD.git']]
                ])
            }
        }
        stage('Sync files') {
            steps {
                sh '''
                    set -e
                    rm -rf "$DEPLOY_DIR/CTFd"
                    rm -rf "$DEPLOY_DIR/frontend"
                    rm -rf "$DEPLOY_DIR/nginx"
                    cp -r "$WORKSPACE/CTFd" "$DEPLOY_DIR/"
                    cp -r "$WORKSPACE/frontend" "$DEPLOY_DIR/"
                    cp -r "$WORKSPACE/nginx" "$DEPLOY_DIR/"
                    cp "$WORKSPACE/docker-compose.prod.yml" "$DEPLOY_DIR/"
                    echo "Sync done"
                    ls -la "$DEPLOY_DIR/"
                '''
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                    set -e
                    cd "$DEPLOY_DIR"
                    docker compose -f docker-compose.prod.yml build --no-cache frontend ctfd ctfd-nginx
                    docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate frontend ctfd ctfd-nginx
                '''
            }
        }
    }
}
