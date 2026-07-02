package models

import (
	"fmt"
	"log"
	"shotmaster-backend/config"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		config.AppConfig.DBHost,
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBName,
		config.AppConfig.DBPort,
		config.AppConfig.DBSSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	// 自动迁移
	err = DB.AutoMigrate(
		&Admin{},
		&User{},
		&ShootingPlanFeedback{},
		&EvalSet{},
		&EvalImage{},
		&EvaluationJob{},
		&EvaluationResult{},
		&SystemConfig{},
		&UserAction{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migrated successfully")

	// 初始化默认管理员
	initDefaultAdmin()

	// 初始化默认配置
	initDefaultConfigs()
}

func initDefaultAdmin() {
	var count int64
	DB.Model(&Admin{}).Count(&count)
	if count > 0 {
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(config.AppConfig.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash admin password: %v", err)
		return
	}

	admin := Admin{
		Username: config.AppConfig.AdminUsername,
		Password: string(hashedPassword),
	}

	result := DB.Create(&admin)
	if result.Error != nil {
		log.Printf("Failed to create default admin: %v", result.Error)
		return
	}

	log.Printf("Default admin created: %s / %s", config.AppConfig.AdminUsername, config.AppConfig.AdminPassword)
}

func initDefaultConfigs() {
	defaultConfigs := []SystemConfig{
		{Key: "ai_model_version", Value: "v1.0.0", Remark: "当前AI模型版本"},
		{Key: "daily_free_quota", Value: "0", Remark: "每日免费评图次数（0表示不限制）"},
		{Key: "gallery_refresh_hours", Value: "48", Remark: "图库刷新间隔（小时）"},
	}

	for _, cfg := range defaultConfigs {
		var existing SystemConfig
		result := DB.Where("key = ?", cfg.Key).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			DB.Create(&cfg)
		}
	}
}
