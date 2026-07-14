package controllers

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"shotmaster-backend/models"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var shanghaiLocation *time.Location

func init() {
	var err error
	shanghaiLocation, err = time.LoadLocation("Asia/Shanghai")
	if err != nil {
		shanghaiLocation = time.FixedZone("CST", 8*3600)
	}
}

func nowInShanghai() time.Time {
	return time.Now().In(shanghaiLocation)
}

func startOfTodayInShanghai() time.Time {
	now := nowInShanghai()
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, shanghaiLocation)
}

func parseDateInShanghai(dateStr string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02", dateStr, shanghaiLocation)
}

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
	HasCompletedOnboarding bool  `json:"hasCompletedOnboarding"`
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

type ScoreFeedbackSyncItem struct {
	ScoreID       string `json:"scoreId"`
	SuggestionKey string `json:"suggestionKey"`
	Title         string `json:"title"`
	Dimension     string `json:"dimension"`
	Liked         bool   `json:"liked"`
	Disliked      bool   `json:"disliked"`
	UpdatedAt     string `json:"updatedAt"`
}

type ScoreFeedbackSyncRequest struct {
	UserID    string                  `json:"userId" binding:"required"`
	Feedbacks []ScoreFeedbackSyncItem `json:"feedbacks"`
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

	now := nowInShanghai()
	prefsJSON, _ := json.Marshal(req.Preferences)

	if result.Error != nil {
		result = models.DB.Where("username = ? AND password IS NOT NULL", req.Username).First(&user)
		if result.Error != nil {
			user = models.User{
				ID:                     req.UserID,
				Username:               req.Username,
				Phone:                  req.Phone,
				Avatar:                 req.Avatar,
				Level:                  req.Level,
				XP:                     req.XP,
				XPToNext:               req.XPToNext,
				Streak:                 req.Streak,
				MaxStreak:              req.MaxStreak,
				TotalStars:             req.TotalStars,
				WorksCount:             req.WorksCount,
				AvgScore:               req.AvgScore,
				IsLoggedIn:             req.IsLoggedIn,
				IsGuest:                req.IsGuest,
				HasCompletedOnboarding: req.HasCompletedOnboarding,
				Preferences:            string(prefsJSON),
				LastActive:             now,
				CreatedAt:              now,
				UpdatedAt:              now,
			}
			models.DB.Create(&user)
		} else {
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
			if req.HasCompletedOnboarding {
				user.HasCompletedOnboarding = true
			}
			user.Preferences = string(prefsJSON)
			user.LastActive = now
			user.UpdatedAt = now
			models.DB.Save(&user)
		}
	} else {
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
		if req.HasCompletedOnboarding {
			user.HasCompletedOnboarding = true
		}
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

		now := nowInShanghai()

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

// 同步评分建议反馈数据
func SyncScoreFeedbacks(c *gin.Context) {
	var req ScoreFeedbackSyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	for _, item := range req.Feedbacks {
		var feedback models.ScoreSuggestionFeedback
		result := models.DB.Where("user_id = ? AND score_id = ? AND suggestion_key = ?",
			req.UserID, item.ScoreID, item.SuggestionKey).First(&feedback)

		now := nowInShanghai()

		if result.Error != nil {
			feedback = models.ScoreSuggestionFeedback{
				UserID:          req.UserID,
				ScoreID:         item.ScoreID,
				SuggestionKey:   item.SuggestionKey,
				SuggestionTitle: item.Title,
				Dimension:       item.Dimension,
				Liked:           item.Liked,
				Disliked:        item.Disliked,
				CreatedAt:       now,
				UpdatedAt:       now,
			}
			models.DB.Create(&feedback)
		} else {
			feedback.Liked = item.Liked
			feedback.Disliked = item.Disliked
			feedback.SuggestionTitle = item.Title
			feedback.Dimension = item.Dimension
			feedback.UpdatedAt = now
			models.DB.Save(&feedback)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"synced":  len(req.Feedbacks),
		"message": "评分反馈数据同步成功",
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

	// 今日活跃用户（按北京时间）
	today := startOfTodayInShanghai()
	var todayActive int64
	models.DB.Model(&models.User{}).Where("last_active >= ?", today).Count(&todayActive)

	// 解析日期范围参数（可选，按北京时间解析）
	startDateStr := c.Query("startDate")
	endDateStr := c.Query("endDate")
	var startDate, endDate time.Time
	var hasDateRange bool
	if startDateStr != "" && endDateStr != "" {
		var err1, err2 error
		startDate, err1 = parseDateInShanghai(startDateStr)
		endDate, err2 = parseDateInShanghai(endDateStr)
		if err1 == nil && err2 == nil {
			// endDate 包含整天（到当天23:59:59）
			endDate = endDate.AddDate(0, 0, 1)
			hasDateRange = true
		}
	}

	// 总反馈数（应用日期范围）
	feedbackQuery := models.DB.Model(&models.ShootingPlanFeedback{})
	if hasDateRange {
		feedbackQuery = feedbackQuery.Where("created_at >= ? AND created_at < ?", startDate, endDate)
	}
	var totalFeedbacks int64
	feedbackQuery.Count(&totalFeedbacks)

	// 点赞率（应用日期范围）
	likedQuery := models.DB.Model(&models.ShootingPlanFeedback{}).Where("liked = ?", true)
	dislikedQuery := models.DB.Model(&models.ShootingPlanFeedback{}).Where("disliked = ?", true)
	if hasDateRange {
		likedQuery = likedQuery.Where("created_at >= ? AND created_at < ?", startDate, endDate)
		dislikedQuery = dislikedQuery.Where("created_at >= ? AND created_at < ?", startDate, endDate)
	}
	var likedCount int64
	var dislikedCount int64
	likedQuery.Count(&likedCount)
	dislikedQuery.Count(&dislikedCount)

	totalVotes := likedCount + dislikedCount
	likeRate := 0.0
	if totalVotes > 0 {
		likeRate = float64(likedCount) / float64(totalVotes)
	}

	// 各维度点赞率（应用日期范围）
	dimensions := []string{"scene", "lighting", "composition", "params", "postProcessing", "equipment"}
	dimensionStats := make([]gin.H, 0)
	for _, dim := range dimensions {
		dimLikedQuery := models.DB.Model(&models.ShootingPlanFeedback{}).Where("dimension = ? AND liked = ?", dim, true)
		dimDislikedQuery := models.DB.Model(&models.ShootingPlanFeedback{}).Where("dimension = ? AND disliked = ?", dim, true)
		if hasDateRange {
			dimLikedQuery = dimLikedQuery.Where("created_at >= ? AND created_at < ?", startDate, endDate)
			dimDislikedQuery = dimDislikedQuery.Where("created_at >= ? AND created_at < ?", startDate, endDate)
		}
		var dimLiked int64
		var dimDisliked int64
		dimLikedQuery.Count(&dimLiked)
		dimDislikedQuery.Count(&dimDisliked)

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

	// 用户增长趋势数据（根据日期范围或默认最近7天）
	dailyStats := make([]gin.H, 0)
	weeklyStats := make([]gin.H, 0)
	monthlyStats := make([]gin.H, 0)

	if hasDateRange {
		// 按日期范围生成每日数据
		days := int(endDate.Sub(startDate).Hours()/24) + 1
		if days > 365 {
			days = 365 // 限制最多365天
		}
		for i := 0; i < days; i++ {
			day := startDate.AddDate(0, 0, i)
			nextDay := day.AddDate(0, 0, 1)
			if !nextDay.After(today.AddDate(0, 0, 1)) {
				var dayNewUsers int64
				models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", day, nextDay).Count(&dayNewUsers)
				dailyStats = append(dailyStats, gin.H{
					"date":     day.Format("2006-01-02"),
					"newUsers": dayNewUsers,
				})
			}
		}
		// 周度和月度也基于日期范围
		weeklyStats = generateWeeklyStatsInRange(startDate, endDate)
		monthlyStats = generateMonthlyStatsInRange(startDate, endDate)
	} else {
		// 默认最近7天（按北京时间）
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

		// 最近4周用户增长（按周统计，按北京时间）
		for i := 3; i >= 0; i-- {
			weekStart := getWeekStart(nowInShanghai().AddDate(0, 0, -i*7))
			weekEnd := weekStart.AddDate(0, 0, 7)
			var weekNewUsers int64
			models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", weekStart, weekEnd).Count(&weekNewUsers)
			weeklyStats = append(weeklyStats, gin.H{
				"week":     weekStart.Format("2006-01-02") + " ~ " + weekEnd.AddDate(0, 0, -1).Format("2006-01-02"),
				"weekNum":  getWeekNumber(weekStart),
				"newUsers": weekNewUsers,
			})
		}

		// 最近6个月用户增长（按月统计，按北京时间）
		for i := 5; i >= 0; i-- {
			monthStart := nowInShanghai().AddDate(0, -i, 0)
			monthStart = time.Date(monthStart.Year(), monthStart.Month(), 1, 0, 0, 0, 0, shanghaiLocation)
			monthEnd := monthStart.AddDate(0, 1, 0)
			var monthNewUsers int64
			models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", monthStart, monthEnd).Count(&monthNewUsers)
			monthlyStats = append(monthlyStats, gin.H{
				"month":     monthStart.Format("2006-01"),
				"monthName": monthStart.Format("1月"),
				"newUsers":  monthNewUsers,
			})
		}
	}

	// 反馈统计（周度/月度，应用日期范围）
	weeklyFeedbackStats := make([]gin.H, 0)
	monthlyFeedbackStats := make([]gin.H, 0)

	if hasDateRange {
		// 按日期范围生成周度反馈统计
		weekStart := getWeekStart(startDate)
		for weekStart.Before(endDate) {
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
			weekStart = weekEnd
		}
		// 按日期范围生成月度反馈统计
		monthStart := time.Date(startDate.Year(), startDate.Month(), 1, 0, 0, 0, 0, shanghaiLocation)
		for monthStart.Before(endDate) {
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
			monthStart = monthEnd
		}
	} else {
		// 默认最近4周反馈统计
		for i := 3; i >= 0; i-- {
			weekStart := getWeekStart(nowInShanghai().AddDate(0, 0, -i*7))
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
		// 默认最近6个月反馈统计
		for i := 5; i >= 0; i-- {
			monthStart := nowInShanghai().AddDate(0, -i, 0)
			monthStart = time.Date(monthStart.Year(), monthStart.Month(), 1, 0, 0, 0, 0, shanghaiLocation)
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
				"disliked": monthDisliked,
				"total":    monthTotal,
				"likeRate": monthRate,
			})
		}
	}

	// 日期范围内的新增用户总数
	var rangeNewUsers int64
	if hasDateRange {
		models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", startDate, endDate).Count(&rangeNewUsers)
	} else {
		rangeNewUsers = totalUsers
	}

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":           totalUsers,
		"todayActive":          todayActive,
		"totalFeedbacks":       totalFeedbacks,
		"likedCount":           likedCount,
		"dislikedCount":        dislikedCount,
		"likeRate":             likeRate,
		"dimensionStats":       dimensionStats,
		"dailyNewUsers":        dailyStats,
		"weeklyNewUsers":       weeklyStats,
		"monthlyNewUsers":      monthlyStats,
		"weeklyFeedbackStats":  weeklyFeedbackStats,
		"monthlyFeedbackStats": monthlyFeedbackStats,
		"rangeNewUsers":        rangeNewUsers,
		"hasDateRange":         hasDateRange,
	})
}

// 生成日期范围内的周度用户增长统计
func generateWeeklyStatsInRange(startDate, endDate time.Time) []gin.H {
	result := make([]gin.H, 0)
	weekStart := getWeekStart(startDate)
	for weekStart.Before(endDate) {
		weekEnd := weekStart.AddDate(0, 0, 7)
		var weekNewUsers int64
		models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", weekStart, weekEnd).Count(&weekNewUsers)
		result = append(result, gin.H{
			"week":     weekStart.Format("2006-01-02") + " ~ " + weekEnd.AddDate(0, 0, -1).Format("2006-01-02"),
			"weekNum":  getWeekNumber(weekStart),
			"newUsers": weekNewUsers,
		})
		weekStart = weekEnd
	}
	return result
}

// 生成日期范围内的月度用户增长统计
func generateMonthlyStatsInRange(startDate, endDate time.Time) []gin.H {
	result := make([]gin.H, 0)
	monthStart := time.Date(startDate.Year(), startDate.Month(), 1, 0, 0, 0, 0, shanghaiLocation)
	for monthStart.Before(endDate) {
		monthEnd := monthStart.AddDate(0, 1, 0)
		var monthNewUsers int64
		models.DB.Model(&models.User{}).Where("created_at >= ? AND created_at < ?", monthStart, monthEnd).Count(&monthNewUsers)
		result = append(result, gin.H{
			"month":     monthStart.Format("2006-01"),
			"monthName": monthStart.Format("1月"),
			"newUsers":  monthNewUsers,
		})
		monthStart = monthEnd
	}
	return result
}

// 获取周起始日期（周一，使用上海时区）
func getWeekStart(t time.Time) time.Time {
	t = t.In(shanghaiLocation)
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday = 7
	}
	return time.Date(t.Year(), t.Month(), t.Day()-weekday+1, 0, 0, 0, 0, shanghaiLocation)
}

// 获取周数
func getWeekNumber(t time.Time) int {
	_, week := t.ISOWeek()
	return week
}

// 生成图片URL的hash
func hashImageURL(url string) string {
	hash := md5.Sum([]byte(url))
	return hex.EncodeToString(hash[:])
}

// ShootingPlanCacheRequest 拍摄建议缓存请求
type ShootingPlanCacheRequest struct {
	ImageURL string `json:"imageUrl" binding:"required"`
}

// ShootingPlanSaveRequest 保存拍摄建议请求
type ShootingPlanSaveRequest struct {
	ImageURL       string          `json:"imageUrl" binding:"required"`
	Category       string          `json:"category"`
	Scene          json.RawMessage `json:"scene"`
	Lighting       json.RawMessage `json:"lighting"`
	Composition    json.RawMessage `json:"composition"`
	Params         json.RawMessage `json:"params"`
	PostProcessing json.RawMessage `json:"postProcessing"`
	Equipment      json.RawMessage `json:"equipment"`
	ShootingIdea   string          `json:"shootingIdea"`
	CommonMistakes json.RawMessage `json:"commonMistakes"`
}

// GetShootingPlanCache 获取拍摄建议缓存
func GetShootingPlanCache(c *gin.Context) {
	var req ShootingPlanCacheRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	imageHash := hashImageURL(req.ImageURL)

	var cache models.ShootingPlanCache
	result := models.DB.Where("image_hash = ?", imageHash).First(&cache)
	if result.Error != nil {
		// 未找到缓存
		c.JSON(http.StatusOK, gin.H{
			"cached": false,
			"data":   nil,
		})
		return
	}

	// 命中次数+1
	models.DB.Model(&cache).UpdateColumn("hit_count", cache.HitCount+1)

	// 组装返回数据
	scene := make(map[string]interface{})
	json.Unmarshal([]byte(cache.Scene), &scene)
	lighting := make(map[string]interface{})
	json.Unmarshal([]byte(cache.Lighting), &lighting)
	composition := make(map[string]interface{})
	json.Unmarshal([]byte(cache.Composition), &composition)
	params := make(map[string]interface{})
	json.Unmarshal([]byte(cache.Params), &params)
	postProcessing := make(map[string]interface{})
	json.Unmarshal([]byte(cache.PostProcessing), &postProcessing)
	equipment := make(map[string]interface{})
	json.Unmarshal([]byte(cache.Equipment), &equipment)

	var commonMistakes []string
	if cache.CommonMistakes != "" {
		json.Unmarshal([]byte(cache.CommonMistakes), &commonMistakes)
	}

	data := gin.H{
		"category":         cache.Category,
		"scene":            scene,
		"lighting":         lighting,
		"composition":      composition,
		"params":           params,
		"postProcessing":   postProcessing,
		"equipment":        equipment,
		"shootingIdea":     cache.ShootingIdea,
		"commonMistakes":   commonMistakes,
	}

	c.JSON(http.StatusOK, gin.H{
		"cached": true,
		"data":   data,
	})
}

// SaveShootingPlanCache 保存拍摄建议缓存
func SaveShootingPlanCache(c *gin.Context) {
	var req ShootingPlanSaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	imageHash := hashImageURL(req.ImageURL)

	// 检查是否已存在
	var existing models.ShootingPlanCache
	result := models.DB.Where("image_hash = ?", imageHash).First(&existing)
	if result.Error == nil {
		// 已存在，更新命中次数
		models.DB.Model(&existing).UpdateColumn("hit_count", existing.HitCount+1)
		c.JSON(http.StatusOK, gin.H{"success": true, "updated": true})
		return
	}

	// 新建缓存
	cache := models.ShootingPlanCache{
		ImageHash:      imageHash,
		ImageURL:       req.ImageURL,
		Category:       req.Category,
		Scene:          string(req.Scene),
		Lighting:       string(req.Lighting),
		Composition:    string(req.Composition),
		Params:         string(req.Params),
		PostProcessing: string(req.PostProcessing),
		Equipment:      string(req.Equipment),
		ShootingIdea:   req.ShootingIdea,
		CommonMistakes: string(req.CommonMistakes),
		HitCount:       1,
	}

	if err := models.DB.Create(&cache).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "updated": false})
}

// ToggleFollowRequest 关注/取消关注请求
type ToggleFollowRequest struct {
	FollowerID string `json:"followerId" binding:"required"` // 发起关注的用户ID
	TargetID   string `json:"targetId" binding:"required"`   // 被关注的用户ID
}

// ToggleFollow 关注/取消关注用户
func ToggleFollow(c *gin.Context) {
	var req ToggleFollowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	if req.FollowerID == req.TargetID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不能关注自己"})
		return
	}

	// 查找两个用户
	var follower, target models.User
	if models.DB.Where("id = ?", req.FollowerID).First(&follower).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}
	if models.DB.Where("id = ?", req.TargetID).First(&target).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "目标用户不存在"})
		return
	}

	// 查询关注记录表判断当前是否已关注
	var followRecord models.UserFollow
	isFollowing := models.DB.Where("follower_id = ? AND target_id = ?", req.FollowerID, req.TargetID).First(&followRecord).Error == nil

	now := nowInShanghai()

	if isFollowing {
		// 取消关注：删除关注记录，更新双方计数
		models.DB.Delete(&followRecord)
		models.DB.Model(&follower).UpdateColumn("following", follower.Following-1)
		models.DB.Model(&target).UpdateColumn("followers", target.Followers-1)
		c.JSON(http.StatusOK, gin.H{
			"success":     true,
			"isFollowing": false,
			"message":     "已取消关注",
		})
	} else {
		// 新建关注：创建关注记录，更新双方计数
		newRecord := models.UserFollow{
			FollowerID: req.FollowerID,
			TargetID:   req.TargetID,
			CreatedAt:  now,
		}
		models.DB.Create(&newRecord)
		models.DB.Model(&follower).UpdateColumn("following", follower.Following+1)
		models.DB.Model(&target).UpdateColumn("followers", target.Followers+1)
		c.JSON(http.StatusOK, gin.H{
			"success":     true,
			"isFollowing": true,
			"message":     "关注成功",
		})
	}
}

// ============== 图片上传 ==============

// UploadImage 上传图片（管理员用）
func UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择要上传的文件"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "只支持 JPG、PNG、GIF、WebP 格式"})
		return
	}

	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件大小不能超过 5MB"})
		return
	}

	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建目录失败"})
		return
	}

	timestamp := time.Now().UnixMilli()
	filename := fmt.Sprintf("%d%s", timestamp, ext)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存文件失败"})
		return
	}

	fileURL := fmt.Sprintf("/uploads/%s", filename)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"url":     fileURL,
		"message": "上传成功",
	})
}

// ============== 本周挑战 ==============

const defaultWeeklyChallengeUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"

type WeeklyChallengeData struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	Title     string `json:"title"`
	Category  string `json:"category"`
	Difficulty string `json:"difficulty"`
	Tags      []string `json:"tags"`
	Author    string `json:"author"`
	AuthorURL string `json:"authorUrl"`
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
}

// GetWeeklyChallenge 获取本周挑战图片
func GetWeeklyChallenge(c *gin.Context) {
	var config models.SystemConfig
	result := models.DB.Where("config_key = ?", "weekly_challenge").First(&config)

	if result.Error != nil {
		// 没有配置，返回默认图片
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"id":         "default_challenge",
				"url":        defaultWeeklyChallengeUrl,
				"title":      "山景构图挑战",
				"category":   "landscape",
				"difficulty": "intermediate",
				"tags":       []string{"山脉", "风景", "构图"},
				"author":     "Samuel Ferrara",
				"authorUrl":  "https://unsplash.com/@samferrara",
			},
		})
		return
	}

	var challengeData WeeklyChallengeData
	if err := json.Unmarshal([]byte(config.Value), &challengeData); err != nil {
		// JSON 解析失败，返回默认
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"id":         "default_challenge",
				"url":        defaultWeeklyChallengeUrl,
				"title":      "山景构图挑战",
				"category":   "landscape",
				"difficulty": "intermediate",
				"tags":       []string{"山脉", "风景", "构图"},
				"author":     "Samuel Ferrara",
				"authorUrl":  "https://unsplash.com/@samferrara",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    challengeData,
	})
}

// SetWeeklyChallenge 设置本周挑战图片（管理员用）
func SetWeeklyChallenge(c *gin.Context) {
	var req struct {
		ID         string   `json:"id"`
		URL        string   `json:"url" binding:"required"`
		Title      string   `json:"title" binding:"required"`
		Category   string   `json:"category"`
		Difficulty string   `json:"difficulty"`
		Tags       []string `json:"tags"`
		Author     string   `json:"author"`
		AuthorURL  string   `json:"authorUrl"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	now := time.Now().In(shanghaiLocation)
	challengeData := WeeklyChallengeData{
		ID:         req.ID,
		URL:        req.URL,
		Title:      req.Title,
		Category:   req.Category,
		Difficulty: req.Difficulty,
		Tags:       req.Tags,
		Author:     req.Author,
		AuthorURL:  req.AuthorURL,
		StartDate:  now.Format("2006-01-02"),
		EndDate:    now.AddDate(0, 0, 7).Format("2006-01-02"),
	}

	jsonData, _ := json.Marshal(challengeData)

	var config models.SystemConfig
	result := models.DB.Where("config_key = ?", "weekly_challenge").First(&config)
	if result.Error != nil {
		config = models.SystemConfig{
			ConfigKey: "weekly_challenge",
			Value:     string(jsonData),
			Remark:    "本周挑战图片",
			CreatedAt: now,
			UpdatedAt: now,
		}
		models.DB.Create(&config)
	} else {
		config.Value = string(jsonData)
		config.UpdatedAt = now
		models.DB.Save(&config)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "设置成功",
		"data":    challengeData,
	})
}
