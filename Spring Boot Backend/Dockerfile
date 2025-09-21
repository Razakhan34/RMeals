# Use OpenJDK 21 as base image
FROM openjdk:21-jdk

# Set working directory
WORKDIR /app

# Copy built jar from target directory
COPY target/rmeals-backend.jar rmeals-backend.jar

# Expose port (change if your app uses a different port)
EXPOSE 8081

# Run the jar file
ENTRYPOINT ["java", "-jar", "rmeals-backend.jar"]
