FROM eclipse-temurin:25-jdk AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B package -DskipTests \
    && java -Djarmode=tools -jar target/banco-api.jar extract --layers --launcher --destination target/extracted

FROM eclipse-temurin:25-jre-alpine
RUN addgroup -S banco && adduser -S banco -G banco
WORKDIR /app
COPY --from=build --chown=banco:banco /workspace/target/extracted/dependencies/ ./
COPY --from=build --chown=banco:banco /workspace/target/extracted/spring-boot-loader/ ./
COPY --from=build --chown=banco:banco /workspace/target/extracted/snapshot-dependencies/ ./
COPY --from=build --chown=banco:banco /workspace/target/extracted/application/ ./
USER banco
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=5 \
    CMD wget -qO- http://localhost:8080/actuator/health/readiness | grep -q '"UP"' || exit 1
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
