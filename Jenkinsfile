pipeline {
    agent any
    
    environment {
        POSTGRES_USER = 'admin'
        POSTGRES_PASSWORD = 'admin'
    }

    tools {
        jdk 'jdk11'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '5'))
    }


    stages {
        // normal build if it's not the master branch and not the support branch, except if it's a SNAPSHOT-version
        stage('Build') {
            /*when {
                not { branch 'master' }
                not {
                    allOf {
                        branch 'support/*'
                        expression { return !VERSION.endsWith("-SNAPSHOT") }
                    }
                }
            }*/
            steps {
                script {
                    // since container is run on host and not within Jenkins, we cannot map init sql file
                    // so we use here a modified postgres image for the tests
                    docker.image('docker-registry.wemove.com/postgres-ige-ng-test').withRun() { c ->
                        // use another container, where we can link the database to so that we can access it
                        docker.image('ubuntu:16.04').inside("--link ${c.id}:db -v /root/.docker/config.json:/root/.docker/config.json") {
                            withEnv(["JAVA_HOME=${ tool 'jdk11' }/jdk-11"]) {
                                nodejs(nodeJSInstallationName: 'nodejs') {
                                    sh './gradlew -PbuildProfile=prod -Djib.console=plain clean build'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage ('Frontend-Tests') {
            steps {
                withEnv(["JAVA_HOME=${ tool 'jdk11' }/jdk-11"]) {
                    nodejs(nodeJSInstallationName: 'nodejs') {
                        script {
                            try {
                                sh './gradlew :frontend:test'
                            } catch(error) {}
                        }
                    }
                }
            }
        }

        // release build if it's the master or the support branch and is not a SNAPSHOT version
        /*stage ('Build-Release') {
            when {
                anyOf { branch 'master'; branch 'support/*' }
                expression { return !VERSION.endsWith("-SNAPSHOT") }
            }
            steps {
                sh './gradlew clean build'
            }
        }*/

        /*stage ('SonarQube Analysis'){
            steps {
                withMaven(
                        maven: 'Maven3',
                        mavenSettingsConfig: '2529f595-4ac5-44c6-8b4f-f79b5c3f4bae'
                ) {
                    withSonarQubeEnv('Wemove SonarQube') {
                        sh 'mvn org.sonarsource.scanner.maven:sonar-maven-plugin:3.4.0.905:sonar'
                    }
                }
            }
        }*/
    }
    post {
        always {
            junit 'server/build/test-results/**/*.xml'
            junit 'frontend/target/surefire-reports/**/*.xml'
        }
        /*changed {
            // send Email with Jenkins' default configuration
            script {
                emailext (
                        body: '${DEFAULT_CONTENT}',
                        subject: '${DEFAULT_SUBJECT}',
                        to: '${DEFAULT_RECIPIENTS}')
            }
        }*/
    }
}
