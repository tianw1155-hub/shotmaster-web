package config

import (
	"fmt"
	"log"
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

	// DatabaseURL 是 PaaS（Render / Railway / Fly.io 等）常见的完整连接串，
	// 若设置则优先使用，不再拼装 DBHost 等字段。
	DatabaseURL string

	JWTSecret      string
	JWTExpireHours string

	AdminUsername string
	AdminPassword string

	// ServerPort 优先读取 PORT（PaaS 标准），其次 SERVER_PORT，默认 8080。
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

		DatabaseURL: getEnv("DATABASE_URL", ""),

		JWTSecret:      getEnv("JWT_SECRET", "shotmaster-secret"),
		JWTExpireHours: getEnv("JWT_EXPIRE_HOURS", "24"),

		AdminUsername: getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "admin123"),

		ServerPort: getEnv("PORT", getEnv("SERVER_PORT", "8080")),
	}

	return nil
}

// LogStartup 输出非敏感启动配置，帮助排查部署后崩溃问题。
func LogStartup() {
	dbSource := "DATABASE_URL"
	if AppConfig.DatabaseURL == "" {
		dbSource = fmt.Sprintf("host=%s port=%s dbname=%s sslmode=%s", AppConfig.DBHost, AppConfig.DBPort, AppConfig.DBName, AppConfig.DBSSLMode)
	}
	log.Printf("[startup] DB_SOURCE=%s, SERVER_PORT=%s", dbSource, AppConfig.ServerPort)
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
