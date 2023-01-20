pipeline {
    agent any

    environment {
        POSTGRES_USER = 'admin'
        POSTGRES_PASSWORD = 'admin'
    }

    tools {
        jdk 'jdk17'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '5'))
        gitLabConnection('GitLab (wemove)')
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
                updateGitlabCommitStatus name: 'build', state: 'running'
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
        changed {
            // send Email with Jenkins' default configuration
            script {
                emailext (
                        body: '${DEFAULT_CONTENT}',
                        subject: '${DEFAULT_SUBJECT}',
                        to: '${DEFAULT_RECIPIENTS}')
            }
        }
        failure {
            updateGitlabCommitStatus name: 'build', state: 'failed'
        }
        unstable {
            updateGitlabCommitStatus name: 'build', state: 'failed'
        }
        success {
            updateGitlabCommitStatus name: 'build', state: 'success'
        }
        aborted {
            updateGitlabCommitStatus name: 'build', state: 'canceled'
        }
    }
}
