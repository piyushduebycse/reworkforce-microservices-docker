FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build
COPY pom.xml .
COPY service-discovery/pom.xml service-discovery/
COPY config-server/pom.xml config-server/
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY leave-service/pom.xml leave-service/
COPY performance-service/pom.xml performance-service/
COPY employee-management-service/pom.xml employee-management-service/
COPY reporting-service/pom.xml reporting-service/
COPY notification-service/pom.xml notification-service/
COPY performance-service/src performance-service/src
RUN mvn -pl performance-service clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/performance-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
