# Build stage
FROM maven:3.8.7-openjdk-18 AS build
WORKDIR /build
COPY project-management-backend/pom.xml .
RUN mvn dependency:go-offline
COPY project-management-backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM amazoncorretto:17
ARG APP_VERSION=1.0.0

WORKDIR /app
COPY --from=build /build/target/project-management-backend*.jar /app/

EXPOSE 8088

ENV DB_URL=jdbc:postgresql://postgres:5432/pmt
ENV JAR_VERSION=${APP_VERSION}
ENV EMAIL_HOST_NAME=missing_host_name
ENV EMAIL_USER_NAME=missing_user_name
ENV EMAIL_PASSWORD=missing_password

CMD java -jar -Dspring.datasource.url=${DB_URL} project-management-backend-${JAR_VERSION}.jar