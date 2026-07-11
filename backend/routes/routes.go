package routes

import (
	"shotmaster-backend/controllers"
	"shotmaster-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// CORS 中间件
	r.Use(middleware.CORSMiddleware())

	// 根路径，兼容部分 PaaS 的默认健康检查
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "ShotMaster Backend is running",
		})
	})

	// 健康检查
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "ShotMaster Backend is running",
		})
	})

	// 管理员登录
	r.POST("/api/admin/login", controllers.AdminLogin)

	// 用户数据同步（前台调用，不需要管理员权限）
	r.POST("/api/users/sync", controllers.SyncUserData)
	r.POST("/api/users/sync-feedbacks", controllers.SyncFeedbacks)

	// 需要认证的管理员路由
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	{
		// 管理员信息
		admin.GET("/me", controllers.GetAdminInfo)

		// 数据看板
		admin.GET("/dashboard/stats", controllers.GetDashboardStats)

		// 用户管理
		admin.GET("/users", controllers.GetUsers)
		admin.GET("/users/:id", controllers.GetUserDetail)

		// 反馈分析
		admin.GET("/feedback/analysis", controllers.GetFeedbackAnalysis)
		admin.GET("/feedback/trend", controllers.GetFeedbackTrend)
		admin.GET("/feedback/low-rated", controllers.GetLowRatedFeedback)

		// 评测集管理
		admin.POST("/eval-sets", controllers.CreateEvalSet)
		admin.GET("/eval-sets", controllers.GetEvalSets)
		admin.GET("/eval-sets/:id", controllers.GetEvalSetDetail)
		admin.PUT("/eval-sets/:id", controllers.UpdateEvalSet)
		admin.DELETE("/eval-sets/:id", controllers.DeleteEvalSet)
		admin.POST("/eval-sets/:id/images", controllers.AddEvalImage)
		admin.GET("/eval-sets/:id/images", controllers.GetEvalImages)
		admin.PUT("/eval-sets/:id/images/:imageId", controllers.UpdateEvalImage)
		admin.DELETE("/eval-sets/:id/images/:imageId", controllers.DeleteEvalImage)

		// 系统配置
		admin.GET("/configs", controllers.GetSystemConfigs)
		admin.PUT("/configs/:key", controllers.UpdateSystemConfig)
		admin.POST("/configs/batch", controllers.BatchUpdateSystemConfigs)
	}
}
