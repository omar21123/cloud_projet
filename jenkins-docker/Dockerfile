FROM jenkins/jenkins:lts-jdk21

USER root

RUN apt-get update && apt-get install -y \
    docker.io \
    docker-compose \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

USER jenkins
