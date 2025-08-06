# Stage 1: Builder
FROM maven:3.9.7-amazoncorretto-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests=true

# Stage 2: Runner
FROM amazoncorretto:21-alpine
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=builder /app/${JAR_FILE} app.jar
EXPOSE 8012
ENTRYPOINT ["java", "-jar", "app.jar"]