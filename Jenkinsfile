pipeline {
    agent any

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
                nodejs(nodeJSInstallationName: 'nodejs') {
                    sh './gradlew clean build'
                }
            }
        }

        stage ('Frontend-Tests') {
            steps {
                nodejs(nodeJSInstallationName: 'nodejs') {
                    sh './gradlew test'
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
