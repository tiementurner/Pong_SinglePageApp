pipeline {
    agent any

    stages {
        stage('Pull code') {
            steps {
                git branch: 'tiemen.blankert.com', url: 'https://github.com/tiementurner/Pong_SinglePageApp.git'
            }
        }
        stage('Build & Deploy') {
            steps {
                sh '''
                  cp /home/tiemen/.pong_env $WORKSPACE/.env
                  docker compose down
                  docker compose up -d --build
                '''
            }
        }
    }
}
