FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY ../../pom.xml /parent-pom.xml
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -f pom.xml

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
