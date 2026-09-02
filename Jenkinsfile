pipeline {
    agent any

    environment {
        IMAGE_NAME = '26fa-ui'
        CONTAINER_NAME = '26fa-ui'
        HOST_PORT = '8080'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify apps') {
            steps {
                sh '''
                    set -eux
                    for package_file in */package.json; do
                      app="${package_file%/package.json}"
                      npm ci --prefix "$app"
                      npm run build --prefix "$app"
                    done
                '''
            }
        }

        stage('Build image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eux
                    docker rm -f "${CONTAINER_NAME}" || true
                    docker run -d                       --name "${CONTAINER_NAME}"                       --restart unless-stopped                       -p "${HOST_PORT}:80"                       "${IMAGE_NAME}:latest"
                '''
            }
        }

        stage('Smoke test') {
            steps {
                sh '''
                    set -eux
                    curl -fsS "http://localhost:${HOST_PORT}/healthz"
                    curl -fsS "http://localhost:${HOST_PORT}/project1/" | grep -i '<div id="app">'
                    curl -fsS "http://localhost:${HOST_PORT}/hw2/" | grep -i '<div id="app">'
                '''
            }
        }
    }
}
