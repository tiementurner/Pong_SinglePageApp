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
                  docker compose down
                  docker compose up -d --build
                '''
            }
        }
    }
}
