FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build
# Copy parent POM
COPY pom.xml .
# Copy all module POMs so Maven can resolve the multi-module structure
COPY service-discovery/pom.xml service-discovery/
COPY config-server/pom.xml config-server/
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY leave-service/pom.xml leave-service/
COPY performance-service/pom.xml performance-service/
COPY employee-management-service/pom.xml employee-management-service/
COPY reporting-service/pom.xml reporting-service/
COPY notification-service/pom.xml notification-service/
# Copy only this service's source
COPY service-discovery/src service-discovery/src
RUN mvn -pl service-discovery clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/service-discovery/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
