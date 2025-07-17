pipeline {
    agent any
    triggers{ cron( getCronParams() ) }

    environment {
        POSTGRES_USER = 'admin'
        POSTGRES_PASSWORD = 'admin'
    }

    tools {
        jdk 'jdk21'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '5'))
    }


    stages {
        // normal build if it's not the master branch and not the support branch, except if it's a SNAPSHOT-version
        stage('Build') {
            when { not { buildingTag() } }
            steps {
                sh './gradlew --no-daemon -PbuildProfile=prod -PbuildDockerImage -Djib.console=plain clean build -x test -x check'
            }
        }

        stage ('Tests') {
            when { not { buildingTag() } }
            steps {
                script {
                    try {
                        sh './gradlew :frontend:test :frontend:testFormatting :server:spotlessCheck'
                    } catch(error) {
                        currentBuild.result = 'UNSTABLE'
                    }

                    sh './gradlew --no-daemon :server:test'
                }
            }
        }

        stage ('Base-Image Update') {
            when { buildingTag() }
            steps {
                sh './gradlew --no-daemon -PbuildProfile=prod -PbuildDockerImage -Djib.console=plain build -x test -x check'
            }
        }


    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'server/build/test-results/**/*.xml'
            junit allowEmptyResults: true, testResults: 'frontend/target/surefire-reports/**/*.xml'
        }
        changed {
            // send Email with Jenkins' default configuration
            script {
                emailext (
                        body: '${DEFAULT_CONTENT}',
                        subject: '${DEFAULT_SUBJECT}',
                        to: '${DEFAULT_RECIPIENTS}')
            }
        }
    }
}

def getCronParams() {
    String tagTimestamp = env.TAG_TIMESTAMP
    long diffInDays = 0
    if (tagTimestamp != null) {
        long diff = "${currentBuild.startTimeInMillis}".toLong() - "${tagTimestamp}".toLong()
        diffInDays = diff / (1000 * 60 * 60 * 24)
        echo "Days since release: ${diffInDays}"
    }

    def versionMatcher = /\d\.\d\.\d(.\d)?/
    if( env.TAG_NAME ==~ versionMatcher && diffInDays < 180) {
        // every Sunday between midnight and 6am
        return 'H H(0-6) * * 0'
    }
    else {
        return ''
    }
}
