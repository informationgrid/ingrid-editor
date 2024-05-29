pipeline {
    agent any
    triggers{ cron( getCronParams() ) }

    environment {
        POSTGRES_USER = 'admin'
        POSTGRES_PASSWORD = 'admin'
    }

    tools {
        jdk 'jdk17'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '5'))
    }


    stages {
        // normal build if it's not the master branch and not the support branch, except if it's a SNAPSHOT-version
        stage('Build') {
            steps {
                script {
                    // since container is run on host and not within Jenkins, we cannot map init sql file
                    // so we use here a modified postgres image for the tests
                    image = docker.image('docker-registry.wemove.com/postgres-ige-ng-test')
                    image.pull()
                    image.withRun() { c ->
                        // use another container, where we can link the database to so that we can access it
                        // for volume mapping remember that we cannot use filesystem from Jenkins container, but only from HOST!
                        docker.image('ubuntu:20.04').inside("--link ${c.id}:db -v /root/.docker/config.json:/root/.docker/config.json --mount type=bind,src=/opt/docker-setup/jenkins-nexus-sonar/jenkins-home/shared-ro-gradle-cache,dst=/.gradle-ro-cache") {
                            withEnv(["GRADLE_RO_DEP_CACHE=/.gradle-ro-cache"]) {
                                nodejs(nodeJSInstallationName: 'nodejs18') {
                                    sh './gradlew --no-daemon -PbuildProfile=prod -PbuildDockerImage -Djib.console=plain clean build'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage ('Frontend-Tests') {
            steps {
                nodejs(nodeJSInstallationName: 'nodejs') {
                    script {
                        try {
                            sh './gradlew :frontend:test'
                        } catch(error) {}
                        try {
                            sh './gradlew :frontend:testFormatting'
                        } catch(error) {
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            junit 'server/build/test-results/**/*.xml'
            junit 'frontend/target/surefire-reports/**/*.xml'
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
    if( env.TAG_NAME ==~ versionMatcher && diffInDays < 365) {
        // once every 7 days between midnight and 6am
        return 'H H(0-6) */7 * *'
    }
    else {
        return ''
    } 
}