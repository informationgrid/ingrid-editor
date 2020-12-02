export JAVA_HOME=/var/jenkins_home/tools/hudson.model.JDK/jdk11/jdk-11/
./gradlew :server:build
cp -r /root/.gradle/caches/* /var/jenkins_home/shared-ro-gradle-cache
find /var/jenkins_home/shared-ro-gradle-cache -type f -name \*.lock -delete
find /var/jenkins_home/shared-ro-gradle-cache -type f -name gc.properties -delete
