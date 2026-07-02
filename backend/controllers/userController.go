package controllers

import (
	"encoding/json"
	"net/http"
	"shotmaster-backend/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type UserSyncRequest struct {
	UserID      string          `json:"userId" binding:"required"`
	Username    string          `json:"username"`
	Phone       string          `json:"phone"`
	Avatar      string          `json:"avatar"`
	Level       int             `json:"level"`
	XP          int             `json:"xp"`
	XPToNext    int             `json:"xpToNext"`
	Streak      int             `json:"streak"`
	MaxStreak   int             `json:"maxStreak"`
	TotalStars  int             `json:"totalStars"`
	WorksCount  int             `json:"worksCount"`
	AvgScore    float64         `json:"avgScore"`
	IsLoggedIn  bool            `json:"isLoggedIn"`
	IsGuest     bool            `json:"isGuest"`
	Preferences json.RawMessage `json:"preferences"`
}

type FeedbackSyncItem struct {
	ImageID    string `json:"imageId"`
	ImageURL   string `json:"imageUrl"`
	ImageTitle string `json:"imageTitle"`
	Category   string `json:"category"`
	Dimension  string `json:"dimension"`
	Liked      bool   `json:"liked"`
	Disliked   bool   `json:"disliked"`
	UpdatedAt  string `json:"updatedAt"`
}

type FeedbackSyncRequest struct {
	UserID    string             `json:"userId" binding:"required"`
	Feedbacks []FeedbackSyncItem `json:"feedbacks"`
}

// 用户数据同步
func SyncUserData(c *gin.Context) {
	var req UserSyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	var user models.User
	result := models.DB.Where("id = ?", req.UserID).First(&user)

	now := time.Now()
	prefsJSON, _ := json.Marshal(req.Preferences)

	if result.Error != nil {
		// 新建用户
		user = models.User{
			ID:          req.UserID,
			Username:    req.Username,
			Phone:       req.Phone,
			Avatar:      req.Avatar,
			Level:       req.Level,
			XP:          req.XP,
			XPToNext:    req.XPToNext,
			Streak:      req.Streak,
			MaxStreak:   req.MaxStreak,
			TotalStars:  req.TotalStars,
			WorksCount:  req.WorksCount,
			AvgScore:    req.AvgScore,
			IsLoggedIn:  req.IsLoggedIn,
			IsGuest:     req.IsGuest,
			Preferences: string(prefsJSON),
			LastActive:  now,
			CreatedAt:   now,
			UpdatedAt:   now,
		}
		models.DB.Create(&user)
	} else {
		// 更新用户
		user.Username = req.Username
		user.Phone = req.Phone
		user.Avatar = req.Avatar
		user.Level = req.Level
		user.XP = req.XP
		user.XPToNext = req.XPToNext
		user.Streak = req.Streak
		user.MaxStreak = req.MaxStreak
		user.TotalStars = req.TotalStars
		user.WorksCount = req.WorksCount
		user.AvgScore = req.AvgScore
		user.IsLoggedIn = req.IsLoggedIn
		user.IsGuest = req.IsGuest
		user.Preferences = string(prefsJSON)
		user.LastActive = now
		user.UpdatedAt = now
		models.DB.Save(&user)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "数据同步成功",
		"userId":  user.ID,
	})
}

// 同步反馈数据
func SyncFeedbacks(c *gin.Context) {
	var req FeedbackSyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	for _, item := range req.Feedbacks {
		var feedback models.ShootingPlanFeedback
		result := models.DB.Where("user_id = ? AND image_id = ? AND dimension = ?",
			req.UserID, item.ImageID, item.Dimension).First(&feedback)

		now := time.Now()

		if result.Error != nil {
			feedback = models.ShootingPlanFeedback{
				UserID:     req.UserID,
				ImageID:    item.ImageID,
				ImageURL:   item.ImageURL,
				ImageTitle: item.ImageTitle,
				Category:   item.Category,
				Dimension:  item.Dimension,
				Liked:      item.Liked,
				Disliked:   item.Disliked,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			models.DB.Create(&feedback)
		} else {
			feedback.Liked = item.Liked
			feedback.Disliked = item.Disliked
			feedback.ImageURL = item.ImageURL
			feedback.ImageTitle = item.ImageTitle
			feedback.Category = item.Category
			feedback.UpdatedAt = now
			models.DB.Save(&feedback)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"synced":   len(req.Feedbacks),
		"message":  "反馈数据同步成功",
	})
}

// 获取用户列表
func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	query := models.DB.Model(&models.User{})
	if keyword != "" {
		query = query.Where("username LIKE ? OR phone LIKE ? OR id LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var users []models.User
	offset := (page - 1) * pageSize
	query.Order("last_active DESC").Offset(offset).Limit(pageSize).Find(&users)

	c.JSON(http.StatusOK, gin.H{
		"list":     users,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// 获取用户详情
func GetUserDetail(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	result := models.DB.Where("id = ?", userID).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	// 获取用户反馈统计
	var feedbackCount int64
	models.DB.Model(&models.ShootingPlanFeedback{}).Where("user_id = ?", userID).Count(&feedbackCount)

	var likedCount int64
	models.DB.Model(&models.ShootingPlanFeedback{}).Where("user_id = ? AND liked = ?", userID, true).Count(&likedCount)

	var dislikedCount int64
	models.DB.Model(&models.ShootingPlanFeedback{}).Where("user_id = ? AND disliked = ?", userID, true).Count(&dislikedCount)

	c.JSON(http.StatusOK, gin.H{
		"user": user,
		"stats": gin.H{
			"totalFeedbacks": feedbackCount,
			"likedCount":     likedCount,
			"dislikedCount":  dislikedCount,
		},
	})
}

// 获取数据看板统计
func GetDashboardStats(c *gin.Context) {
	var totalUsers int64
	models.DB.Model(&models.User{}).Count(&totalUsers)

	// 今日活跃用户
	today := time.Now().Truncate(24 * time.Hour)
	var todayActive int64
	models.DB.Model(&models.User{}).Where("last_active >= ?", today).Count(&todayActive)

	// 总反馈数
	var totalFeedbacks int64
	models.DB.Model(&models.ShootingPlanFeedback{}).Count(&totalFeedbacks)

	// 点赞率
	var likedCount int64
	models.DB.Model(&models.ShootingPlanFeedback{}).Where("liked = ?", true).Count(&likedCount)

	var dislikedCount int64
	models.DB.Model(&models.ShootingPlanFeedback{}).Where("disliked = ?", true).Count(&dislikedCount)

	totalVotes := likedCount + dislikedCount
	likeRate := 0.0
	if totalVotes > 0 {
		likeRate = float64(likedCount) / float64(totalVotes)
	}

	// 各维度点赞率
	dimensions := []string{"scene", "lighting", "composition", "params", "postProcessing", "equipment"}
	dimensionStats := make([]gin.H, 0)
	for _, dim := range dimensions {
		var dimLiked int64
		var dimDisliked int64
		models.DB.Model(&models.ShootingPlanFeedback{}).Where("dimension = ? AND liked = ?", dim, true).Count(&dimLiked)
		models.DB.Model(&models.ShootingPlanFeedback{}).Where("dimension = ? AND disliked = ?", dim, true).Count(&dimDisliked)

		dimTotal := dimLiked + dimDisliked
		dimRate := 0.0
		if dimTotal > 0 {
			dimRate = float64(dimLiked) / float64(dimTotal)
		}
		dimensionStats = append(dimensionStats, gin.H{
			"dimension": dim,
			"liked":     dimLiked,
			"disliked":  dimDisliked,
			"total":     dimTotal,
			"likeRate":  dimRate,
		})
	}

	// 最近7天用户增长
	dailyStats := make([]gin.H, 0)
	for i := 6; i >= 0; i-- {
		day := today.AddDate(0, 0, -i)
		nextDay := day.AddDate(0, 0, 1)
		var dayNewUsers int64
		models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", day, nextDay).Count(&dayNewUsers)
		dailyStats = append(dailyStats, gin.H{
			"date":     day.Format("2006-01-02"),
			"newUsers": dayNewUsers,
		})
	}

	// 最近4周用户增长（按周统计）
	weeklyStats := make([]gin.H, 0)
	for i := 3; i >= 0; i-- {
		// 计算周的起始日期（周一）
		weekStart := getWeekStart(time.Now().AddDate(0, 0, -i*7))
		weekEnd := weekStart.AddDate(0, 0, 7)
		var weekNewUsers int64
		models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", weekStart, weekEnd).Count(&weekNewUsers)
		weeklyStats = append(weeklyStats, gin.H{
			"week":     weekStart.Format("2006-01-02") + " ~ " + weekEnd.AddDate(0, 0, -1).Format("2006-01-02"),
			"weekNum":  getWeekNumber(weekStart),
			"newUsers": weekNewUsers,
		})
	}

	// 最近6个月用户增长（按月统计）
	monthlyStats := make([]gin.H, 0)
	for i := 5; i >= 0; i-- {
		monthStart := time.Now().AddDate(0, -i, 0)
		monthStart = time.Date(monthStart.Year(), monthStart.Month(), 1, 0, 0, 0, 0, time.Local)
		monthEnd := monthStart.AddDate(0, 1, 0)
		var monthNewUsers int64
		models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", monthStart, monthEnd).Count(&monthNewUsers)
		monthlyStats = append(monthlyStats, gin.H{
			"month":    monthStart.Format("2006-01"),
			"monthName": monthStart.Format("1月"),
			"newUsers": monthNewUsers,
		})
	}

	// 周度反馈统计
	weeklyFeedbackStats := make([]gin.H, 0)
	for i := 3; i >= 0; i-- {
		weekStart := getWeekStart(time.Now().AddDate(0, 0, -i*7))
		weekEnd := weekStart.AddDate(0, 0, 7)
		var weekLiked int64
		var weekDisliked int64
		models.DB.Model(&models.ShootingPlanFeedback{}).Where("created_at >= ? AND created_at < ? AND liked = ?", weekStart, weekEnd, true).Count(&weekLiked)
		models.DB.Model(&models.ShootingPlanFeedback{}).Where("created_at >= ? AND created_at < ? AND disliked = ?", weekStart, weekEnd, true).Count(&weekDisliked)
		weekTotal := weekLiked + weekDisliked
		weekRate := 0.0
		if weekTotal > 0 {
			weekRate = float64(weekLiked) / float64(weekTotal)
		}
		weeklyFeedbackStats = append(weeklyFeedbackStats, gin.H{
			"week":     weekStart.Format("2006-01-02"),
			"weekNum":  getWeekNumber(weekStart),
			"liked":    weekLiked,
			"disliked": weekDisliked,
			"total":    weekTotal,
			"likeRate": weekRate,
		})
	}

	// 月度反馈统计
	monthlyFeedbackStats := make([]gin.H, 0)
	for i := 5; i >= 0; i-- {
		monthStart := time.Now().AddDate(0, -i, 0)
		monthStart = time.Date(monthStart.Year(), monthStart.Month(), 1, 0, 0, 0, 0, time.Local)
		monthEnd := monthStart.AddDate(0, 1, 0)
		var monthLiked int64
		var monthDisliked int64
		models.DB.Model(&models.ShootingPlanFeedback{}).Where("created_at >= ? AND created_at < ? AND liked = ?", monthStart, monthEnd, true).Count(&monthLiked)
		models.DB.Model(&models.ShootingPlanFeedback{}).Where("created_at >= ? AND created_at < ? AND disliked = ?", monthStart, monthEnd, true).Count(&monthDisliked)
		monthTotal := monthLiked + monthDisliked
		monthRate := 0.0
		if monthTotal > 0 {
			monthRate = float64(monthLiked) / float64(monthTotal)
		}
		monthlyFeedbackStats = append(monthlyFeedbackStats, gin.H{
			"month":     monthStart.Format("2006-01"),
			"monthName": monthStart.Format("1月"),
			"liked":     monthLiked,
			"disliked":  monthDisliked,
			"total":     monthTotal,
			"likeRate":  monthRate,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":         totalUsers,
		"todayActive":        todayActive,
		"totalFeedbacks":     totalFeedbacks,
		"likedCount":         likedCount,
		"dislikedCount":      dislikedCount,
		"likeRate":           likeRate,
		"dimensionStats":     dimensionStats,
		"dailyNewUsers":      dailyStats,
		"weeklyNewUsers":     weeklyStats,
		"monthlyNewUsers":    monthlyStats,
		"weeklyFeedbackStats":  weeklyFeedbackStats,
		"monthlyFeedbackStats": monthlyFeedbackStats,
	})
}

// 获取周起始日期（周一）
func getWeekStart(t time.Time) time.Time {
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday = 7
	}
	return t.AddDate(0, 0, -weekday+1).Truncate(24 * time.Hour)
}

// 获取周数
func getWeekNumber(t time.Time) int {
	_, week := t.ISOWeek()
	return week
}
