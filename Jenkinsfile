pipeline {
    agent any
    triggers{ cron( getCronParams() ) }

    environment {
        POSTGRES_USER = 'admin'
        POSTGRES_PASSWORD = 'admin'
    }

    tools {
        jdk 'jdk25'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '5'))
        disableConcurrentBuilds()
    }


    stages {
        // normal build if it's not the master branch and not the support branch, except if it's a SNAPSHOT-version
        stage('Build') {
            when { not { buildingTag() } }
            steps {
                sh './gradlew -PbuildProfile=prod -PbuildDockerImage -Plock -Djib.console=plain clean build cyclonedxBom -x test -x check'
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

                    sh './gradlew :server:test'
                }
            }
        }

        stage ('Base-Image Update') {
            when { buildingTag() }
            steps {
                sh './gradlew -PbuildProfile=prod -PbuildDockerImage -Djib.console=plain build -x test -x check'
            }
        }

        stage ('Build RPM') {
            when { expression { return shouldBuildDevOrRelease() } }
            agent {
                docker {
                    image 'docker-registry.wemove.com/ingrid-rpmbuilder'
                    reuseNode true
                }
            }
            steps {
                script {
                    sh "sed -i 's/^Version:.*/Version: ${determineRpmVersion()}/' rpm/ingrid-editor.spec"
                    sh "sed -i 's/^Release:.*/Release: ${determineRpmReleasePart()}/' rpm/ingrid-editor.spec"

                    // Prepare build
                    sh "mkdir -p ./build/rpms /root/rpmbuild/SPECS"
                    sh """
                        cp ${WORKSPACE}/rpm/ingrid-editor.spec /root/rpmbuild/SPECS/ingrid-editor.spec &&
                        rpmbuild -bb /root/rpmbuild/SPECS/ingrid-editor.spec
                    """

                    withCredentials([
                            file(credentialsId: 'ingrid-rpm-public', variable: 'RPM_PUBLIC_KEY'),
                            file(credentialsId: 'ingrid-rpm-private', variable: 'RPM_PRIVATE_KEY'),
                            string(credentialsId: 'ingrid-rpm-passphrase', variable: 'RPM_SIGN_PASSPHRASE')
                        ]) {
                        sh 'gpg --batch --import $RPM_PUBLIC_KEY'
                        sh 'gpg --batch --import $RPM_PRIVATE_KEY'
                        sh "mkdir -p ./build/rpms/ingrid"
                        sh "cp -r /root/rpmbuild/RPMS/noarch/* ${WORKSPACE}/build/rpms/ingrid/"
                        sh "expect /rpm-sign.exp ${WORKSPACE}/build/rpms/ingrid/*.rpm"

                        archiveArtifacts artifacts: 'build/rpms/ingrid/ingrid-editor-*.rpm', fingerprint: true
                    }

                    withCredentials([
                            file(credentialsId: 'itzbund-ingrid-rpm-public', variable: 'RPM_PUBLIC_KEY'),
                            file(credentialsId: 'itzbund-ingrid-rpm-private', variable: 'RPM_PRIVATE_KEY'),
                            string(credentialsId: 'itzbund-ingrid-rpm-passphrase', variable: 'RPM_SIGN_PASSPHRASE')
                        ]) {
                        sh 'rm -f ~/.gnupg/*.kbx'
                        sh 'rm -f ~/.gnupg/*.gpg'
                        sh 'gpg --batch --import $RPM_PUBLIC_KEY'
                        sh 'gpg --batch --import $RPM_PRIVATE_KEY'
                        sh "mkdir -p ./build/rpms/itzbund"
                        sh "cp -r /root/rpmbuild/RPMS/noarch/* ${WORKSPACE}/build/rpms/itzbund/"
                        sh "expect /rpm-sign.exp ${WORKSPACE}/build/rpms/itzbund/*.rpm"

                        archiveArtifacts artifacts: 'build/rpms/itzbund/ingrid-editor-*.rpm', fingerprint: true
                    }
                }
            }
        }

        stage('Deploy RPM') {
            when { expression { return shouldBuildDevOrRelease() } }
            steps {
                script {
                    def repoType = env.TAG_NAME ? "rpm-ingrid-releases" : "rpm-ingrid-snapshots"
                    sh "mv build/reports/bom.json build/reports/ingrid-editor-${determineRpmVersion()}.bom.json"
                    archiveArtifacts artifacts: "build/reports/*.bom.json", fingerprint: true

                    withCredentials([usernamePassword(credentialsId: '9623a365-d592-47eb-9029-a2de40453f68', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                        sh '''
                            curl -f --user $USERNAME:$PASSWORD --upload-file build/rpms/ingrid/*.rpm https://nexus.informationgrid.eu/repository/''' + repoType + '''/
                            curl -f --user $USERNAME:$PASSWORD --upload-file build/reports/*.bom.json https://nexus.informationgrid.eu/repository/''' + repoType + '''/
                        '''
                    }
                    if (repoType == 'rpm-ingrid-releases') {
                        withCredentials([usernamePassword(credentialsId: '9623a365-d592-47eb-9029-a2de40453f68', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                            sh '''
                                curl -f --user $USERNAME:$PASSWORD --upload-file build/rpms/itzbund/*.rpm https://nexus.informationgrid.eu/repository/rpm-ingrid-itzbund/
                                curl -f --user $USERNAME:$PASSWORD --upload-file build/reports/*.bom.json https://nexus.informationgrid.eu/repository/rpm-ingrid-itzbund/
                            '''
                        }
                        if (env.TAG_NAME && env.TAG_NAME.startsWith("RPM-")) {
                            // No upload to other ITZBund repos
                        } else {
                            withCredentials([usernamePassword(credentialsId: '9623a365-d592-47eb-9029-a2de40453f68', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                                sh '''
                                    curl -f --user $USERNAME:$PASSWORD --upload-file build/rpms/itzbund/*.rpm https://nexus.informationgrid.eu/repository/rpm-zdm_release/
                                    curl -f --user $USERNAME:$PASSWORD --upload-file build/reports/*.bom.json https://nexus.informationgrid.eu/repository/rpm-zdm_release/
                                '''
                            }
                        }
                    }
                }
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

def shouldBuildDevOrRelease() {
    // If no tag is being built OR it is the first build of a tag
    boolean isTag = env.TAG_NAME != null && env.TAG_NAME.trim() != ''
    return !isTag || (isTag && currentBuild.number == 1)
}

def determineVersion() {
    if (env.TAG_NAME) {
        if (env.TAG_NAME.startsWith("RPM-")) { // e.g. RPM-8.0.0-0.1SNAPSHOT
            def lastDashIndex = env.TAG_NAME.lastIndexOf("-")
            return env.TAG_NAME.substring(4, lastDashIndex)
        }
        return env.TAG_NAME
    } else {
        return env.BRANCH_NAME.replaceAll('/', '_')
    }
}

def determineRpmVersion() {
    return determineVersion().replaceAll('-', '_')
}

def determineRpmReleasePart() {
    if (env.TAG_NAME) {
        if (env.TAG_NAME.startsWith("RPM-")) {
            return env.TAG_NAME.substring(env.TAG_NAME.lastIndexOf("-") + 1)
        }
        return '1'
    } else {
        return 'dev'
    }
}
