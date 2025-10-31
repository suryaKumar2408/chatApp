
FROM maven:3.8.7-eclipse-temurin-17 AS build

WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN ./mvnw dependency:go-offline -B

COPY src src

RUN ./mvnw install -DskipTests

FROM eclipse-temurin:17-jre-alpine

EXPOSE 8080

ARG JAR_FILE=target/app-0.0.1-SNAPSHOT.jar
COPY --from=build /app/${JAR_FILE} app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]