package main

import (
	"log"
	"shotmaster-backend/config"
	"shotmaster-backend/models"
	"shotmaster-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化数据库
	models.InitDB()

	// 设置 Gin 模式
	gin.SetMode(gin.ReleaseMode)

	// 创建 Gin 引擎
	r := gin.Default()

	// 设置路由
	routes.SetupRoutes(r)

	// 启动服务
	log.Printf("Server starting on port %s ...", config.AppConfig.ServerPort)
	log.Printf("Admin login: POST /api/admin/login")
	log.Printf("Health check: GET /api/health")

	if err := r.Run(":" + config.AppConfig.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
