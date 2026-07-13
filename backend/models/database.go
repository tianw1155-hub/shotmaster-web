package models

import (
	"fmt"
	"log"
	"shotmaster-backend/config"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var dsn string
	if config.AppConfig.DatabaseURL != "" {
		dsn = config.AppConfig.DatabaseURL
	} else {
		dsn = fmt.Sprintf(
			"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Asia%%2FShanghai&tls=skip-verify",
			config.AppConfig.DBUser,
			config.AppConfig.DBPassword,
			config.AppConfig.DBHost,
			config.AppConfig.DBPort,
			config.AppConfig.DBName,
		)
	}

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	err = DB.AutoMigrate(
		&Admin{},
		&User{},
		&UserFollow{},
		&ShootingPlanFeedback{},
		&ScoreSuggestionFeedback{},
		&UserTextFeedback{},
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

	initDefaultAdmin()
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
		{ConfigKey: "ai_model_version", Value: "v1.0.0", Remark: "当前AI模型版本"},
		{ConfigKey: "daily_free_quota", Value: "0", Remark: "每日免费评图次数（0表示不限制）"},
		{ConfigKey: "gallery_refresh_hours", Value: "48", Remark: "图库刷新间隔（小时）"},
	}

	for _, cfg := range defaultConfigs {
		var existing SystemConfig
		result := DB.Where("config_key = ?", cfg.ConfigKey).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			DB.Create(&cfg)
		}
	}
}
