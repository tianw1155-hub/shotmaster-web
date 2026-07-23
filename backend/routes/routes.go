package routes

import (
	"shotmaster-backend/controllers"
	"shotmaster-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// CORS 中间件
	r.Use(middleware.CORSMiddleware())

	// 健康检查
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "ShotMaster Backend is running",
		})
	})

	// 管理员登录
	r.POST("/api/admin/login", controllers.AdminLogin)

	// 普通用户注册/登录（不需要认证）
	r.POST("/api/auth/register", controllers.UserRegister)
	r.POST("/api/auth/login", controllers.UserLogin)

	// 用户数据同步（前台调用，不需要管理员权限）
	r.POST("/api/users/sync", controllers.SyncUserData)
	r.POST("/api/users/sync-feedbacks", controllers.SyncFeedbacks)
	r.POST("/api/users/sync-score-feedbacks", controllers.SyncScoreFeedbacks)
	r.POST("/api/users/toggle-follow", controllers.ToggleFollow)
	r.POST("/api/feedback/submit", controllers.SubmitTextFeedback)

	// 本周挑战（前台调用）
	r.GET("/api/weekly-challenge", controllers.GetWeeklyChallenge)
        r.GET("/api/community-works", controllers.GetCommunityWorks)
        r.POST("/api/community-works", controllers.SubmitCommunityWork)
        r.POST("/api/community-works/vote", controllers.VoteCommunityWork)
        r.DELETE("/api/community-works/:id", controllers.DeleteCommunityWork)
        r.POST("/api/community-works/migrate-guest", controllers.MigrateGuestWorks)

	// 拍摄建议缓存（前台调用，不需要管理员权限）
	r.POST("/api/shooting-plan/cache", controllers.GetShootingPlanCache)
	r.POST("/api/shooting-plan/cache/save", controllers.SaveShootingPlanCache)

	// 日志上报（前台调用）
	r.POST("/api/logs/ai-call", controllers.ReportAiCall)
	r.POST("/api/logs/unsplash-call", controllers.ReportUnsplashCall)
	r.POST("/api/logs/page-visit", controllers.ReportPageVisit)

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
		admin.GET("/feedback/score/list", controllers.GetScoreFeedbackList)
		admin.GET("/feedback/score/stats", controllers.GetScoreFeedbackStats)
		admin.GET("/feedback/text/list", controllers.GetTextFeedbackList)
		admin.PUT("/feedback/text/:id/status", controllers.UpdateTextFeedbackStatus)

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

		// 本周挑战管理
		admin.POST("/weekly-challenge", controllers.SetWeeklyChallenge)
		admin.POST("/upload", controllers.UploadImage)

		// 系统日志
		admin.GET("/logs/ai-stats", controllers.GetAiCallStats)
		admin.GET("/logs/ai-list", controllers.GetAiCallList)
		admin.GET("/logs/unsplash-stats", controllers.GetUnsplashCallStats)
		admin.GET("/logs/unsplash-list", controllers.GetUnsplashCallList)
		admin.GET("/logs/page-visit-stats", controllers.GetPageVisitStats)
		admin.GET("/logs/page-visit-list", controllers.GetPageVisitList)
	}

	r.Static("/uploads", "./uploads")
}
