pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy') {
            steps {
                sh '''
                # On recrée le fichier .env avec tes vraies clés
                echo "DB_ROOT_PASSWORD=5y36g~Q7%gw2" > .env
                echo "DB_PASSWORD=5y36g~Q7%gw2" >> .env
                echo "CTFD_SECRET_KEY=5y36g~Q7%gw2" >> .env
                echo "MARIADB_USER=ctfd" >> .env
                echo "MARIADB_DATABASE=ctfd" >> .env
                echo "DATABASE_URL=mysql+pymysql://ctfd:5y36g~Q7%gw2@secops-db/ctfd" >> .env
                echo "REDIS_URL=redis://secops-redis:6379" >> .env

                # On déploie avec le nom de projet 'cloud_projet' pour écraser l'ancien
                # On force le build du frontend pour voir tes modifs immédiatement
                docker compose -p cloud_projet -f docker-compose.prod.yml up -d --build frontend
                '''
            }
        }
    }

    post {
        success {
            echo 'Succès ! Ton site est à jour sur project-cloud.online'
        }
    }
}
