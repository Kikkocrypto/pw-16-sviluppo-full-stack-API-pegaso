# Dockerfile per Backend Spring Boot

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copia file di configurazione Maven
COPY pom.xml .

# Scarica le dipendenze (cache layer)
RUN mvn dependency:go-offline -B

# Copia il codice sorgente
COPY src ./src

# Build dell'applicazione
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Crea utente non-root per sicurezza
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copia il JAR dal stage di build
COPY --from=build /app/target/*.jar app.jar

# Espone la porta dell'applicazione
EXPOSE 8080

# Variabili d'ambiente
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Entrypoint
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
