package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	JWTSecret      string
	JWTExpireHours string

	AdminUsername string
	AdminPassword string

	ServerPort string
}

var AppConfig Config

func LoadConfig() error {
	godotenv.Load()

	AppConfig = Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "shotmaster"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret:      getEnv("JWT_SECRET", "shotmaster-secret"),
		JWTExpireHours: getEnv("JWT_EXPIRE_HOURS", "24"),

		AdminUsername: getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "admin123"),

		ServerPort: getEnv("SERVER_PORT", "8080"),
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
