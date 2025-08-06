# Stage 1: Builder
FROM amazoncorretto:21 AS builder
USER root
WORKDIR /app
RUN apk update && apk add maven # Instala Maven
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests=true

# Stage 2: Runner
FROM amazoncorretto:21-alpine
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=builder /app/${JAR_FILE} app.jar
EXPOSE 8013
ENTRYPOINT ["java", "-jar", "app.jar"]