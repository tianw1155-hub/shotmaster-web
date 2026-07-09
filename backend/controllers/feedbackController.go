package controllers

import (
	"net/http"
	"shotmaster-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

var feedbackShanghaiLocation *time.Location

func init() {
	var err error
	feedbackShanghaiLocation, err = time.LoadLocation("Asia/Shanghai")
	if err != nil {
		feedbackShanghaiLocation = time.FixedZone("CST", 8*3600)
	}
}

func feedbackNow() time.Time {
	return time.Now().In(feedbackShanghaiLocation)
}

func feedbackStartOfToday() time.Time {
	now := feedbackNow()
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, feedbackShanghaiLocation)
}

func feedbackParseDate(dateStr string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02", dateStr, feedbackShanghaiLocation)
}

// 获取反馈分析详情
func GetFeedbackAnalysis(c *gin.Context) {
	dimension := c.Query("dimension")
	startDateStr := c.Query("startDate")
	endDateStr := c.Query("endDate")

	var feedbacks []models.ShootingPlanFeedback
	query := models.DB.Model(&models.ShootingPlanFeedback{})

	if startDateStr != "" && endDateStr != "" {
		startDate, err1 := feedbackParseDate(startDateStr)
		endDate, err2 := feedbackParseDate(endDateStr)
		if err1 == nil && err2 == nil {
			endDate = endDate.AddDate(0, 0, 1)
			query = query.Where("created_at >= ? AND created_at < ?", startDate, endDate)
		}
	}

	query.Find(&feedbacks)

	// 统计各维度数据
	dimensionStats := make(map[string]map[string]int)
	dimensions := []string{"scene", "lighting", "composition", "params", "postProcessing", "equipment"}

	for _, dim := range dimensions {
		dimensionStats[dim] = map[string]int{
			"liked":    0,
			"disliked": 0,
			"total":    0,
		}
	}

	for _, fb := range feedbacks {
		if fb.Dimension != "" {
			if fb.Liked {
				dimensionStats[fb.Dimension]["liked"]++
			}
			if fb.Disliked {
				dimensionStats[fb.Dimension]["disliked"]++
			}
			dimensionStats[fb.Dimension]["total"]++
		}
	}

	// 计算好评率
	result := make([]gin.H, 0)
	for _, dim := range dimensions {
		stats := dimensionStats[dim]
		likeRate := 0.0
		if stats["total"] > 0 {
			likeRate = float64(stats["liked"]) / float64(stats["total"])
		}
		result = append(result, gin.H{
			"dimension": dim,
			"liked":     stats["liked"],
			"disliked":  stats["disliked"],
			"total":     stats["total"],
			"likeRate":  likeRate,
		})
	}

	// 如果指定了维度，返回该维度的详细反馈
	if dimension != "" {
		var detailFeedbacks []models.ShootingPlanFeedback
		models.DB.Where("dimension = ?", dimension).Order("created_at DESC").Limit(100).Find(&detailFeedbacks)

		c.JSON(http.StatusOK, gin.H{
			"dimensionStats": result,
			"detailFeedbacks": detailFeedbacks,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"dimensionStats": result,
	})
}

// 获取反馈趋势
func GetFeedbackTrend(c *gin.Context) {
	days := c.Query("days")
	if days == "" {
		days = "7"
	}

	var trendData []gin.H
	today := feedbackStartOfToday()

	for i := 6; i >= 0; i-- {
		day := today.AddDate(0, 0, -i)
		nextDay := day.AddDate(0, 0, 1)
		dateStr := day.Format("2006-01-02")

		var likedCount, dislikedCount int64
		models.DB.Model(&models.ShootingPlanFeedback{}).
			Where("created_at >= ? AND created_at < ? AND liked = ?", day, nextDay, true).
			Count(&likedCount)
		models.DB.Model(&models.ShootingPlanFeedback{}).
			Where("created_at >= ? AND created_at < ? AND disliked = ?", day, nextDay, true).
			Count(&dislikedCount)

		trendData = append(trendData, gin.H{
			"date":     dateStr,
			"liked":    likedCount,
			"disliked": dislikedCount,
			"total":    likedCount + dislikedCount,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": trendData,
	})
}

// 获取低评分反馈（需要改进的部分）
func GetLowRatedFeedback(c *gin.Context) {
	limit := c.DefaultQuery("limit", "50")

	var feedbacks []models.ShootingPlanFeedback
	models.DB.Where("disliked = ?", true).
		Order("created_at DESC").
		Limit(parseIntOrDefault(limit, 50)).
		Find(&feedbacks)

	// 按维度分组统计
	dimensionCounts := make(map[string]int)
	for _, fb := range feedbacks {
		if fb.Dimension != "" {
			dimensionCounts[fb.Dimension]++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":           feedbacks,
		"dimensionCounts": dimensionCounts,
	})
}

// 获取评图建议反馈列表
func GetScoreFeedbackList(c *gin.Context) {
	feedbackType := c.Query("type")       // liked / disliked / all
	dimension := c.Query("dimension")      // 按维度筛选
	startDateStr := c.Query("startDate")
	endDateStr := c.Query("endDate")

	query := models.DB.Model(&models.ScoreSuggestionFeedback{})

	if feedbackType == "liked" {
		query = query.Where("liked = ?", true)
	} else if feedbackType == "disliked" {
		query = query.Where("disliked = ?", true)
	}

	if dimension != "" {
		query = query.Where("dimension = ?", dimension)
	}

	if startDateStr != "" && endDateStr != "" {
		startDate, err1 := feedbackParseDate(startDateStr)
		endDate, err2 := feedbackParseDate(endDateStr)
		if err1 == nil && err2 == nil {
			endDate = endDate.AddDate(0, 0, 1)
			query = query.Where("created_at >= ? AND created_at < ?", startDate, endDate)
		}
	}

	var feedbacks []models.ScoreSuggestionFeedback
	query.Order("created_at DESC").Limit(500).Find(&feedbacks)

	c.JSON(http.StatusOK, gin.H{
		"data":  feedbacks,
		"total": len(feedbacks),
	})
}

// 获取评图建议反馈统计（用于柱状图）
func GetScoreFeedbackStats(c *gin.Context) {
	feedbackType := c.Query("type")    // liked / disliked / all
	dimension := c.Query("dimension")   // 按维度筛选
	startDateStr := c.Query("startDate")
	endDateStr := c.Query("endDate")

	query := models.DB.Model(&models.ScoreSuggestionFeedback{})

	if feedbackType == "liked" {
		query = query.Where("liked = ?", true)
	} else if feedbackType == "disliked" {
		query = query.Where("disliked = ?", true)
	}

	if dimension != "" {
		query = query.Where("dimension = ?", dimension)
	}

	if startDateStr != "" && endDateStr != "" {
		startDate, err1 := feedbackParseDate(startDateStr)
		endDate, err2 := feedbackParseDate(endDateStr)
		if err1 == nil && err2 == nil {
			endDate = endDate.AddDate(0, 0, 1)
			query = query.Where("created_at >= ? AND created_at < ?", startDate, endDate)
		}
	}

	var feedbacks []models.ScoreSuggestionFeedback
	query.Find(&feedbacks)

	// 按 suggestionKey 分组统计
	type StatItem struct {
		SuggestionKey   string `json:"suggestionKey"`
		SuggestionTitle string `json:"suggestionTitle"`
		Dimension       string `json:"dimension"`
		Liked           int    `json:"liked"`
		Disliked        int    `json:"disliked"`
		Total           int    `json:"total"`
	}

	statsMap := make(map[string]*StatItem)
	for _, fb := range feedbacks {
		key := fb.SuggestionKey
		if _, exists := statsMap[key]; !exists {
			statsMap[key] = &StatItem{
				SuggestionKey:   key,
				SuggestionTitle: fb.SuggestionTitle,
				Dimension:       fb.Dimension,
			}
		}
		if fb.Liked {
			statsMap[key].Liked++
		}
		if fb.Disliked {
			statsMap[key].Disliked++
		}
		statsMap[key].Total++
	}

	// 转为切片并按总数排序
	stats := make([]StatItem, 0, len(statsMap))
	for _, s := range statsMap {
		stats = append(stats, *s)
	}
	// 按总数降序排序
	for i := 0; i < len(stats); i++ {
		for j := i + 1; j < len(stats); j++ {
			if stats[j].Total > stats[i].Total {
				stats[i], stats[j] = stats[j], stats[i]
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  stats,
		"total": len(stats),
	})
}

func parseIntOrDefault(s string, defaultVal int) int {
	var result int
	for _, c := range s {
		if c >= '0' && c <= '9' {
			result = result*10 + int(c-'0')
		} else {
			return defaultVal
		}
	}
	if result == 0 {
		return defaultVal
	}
	return result
}

// 获取系统配置列表
func GetSystemConfigs(c *gin.Context) {
	var configs []models.SystemConfig
	models.DB.Find(&configs)

	c.JSON(http.StatusOK, gin.H{
		"data": configs,
	})
}

// 更新系统配置
func UpdateSystemConfig(c *gin.Context) {
	key := c.Param("key")

	var config models.SystemConfig
	if err := models.DB.Where("key = ?", key).First(&config).Error; err != nil {
		// 如果不存在，创建新的
		config = models.SystemConfig{
			Key:       key,
			CreatedAt: feedbackNow(),
		}
	}

	var req struct {
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	config.Value = req.Value
	config.UpdatedAt = feedbackNow()

	if config.ID == 0 {
		models.DB.Create(&config)
	} else {
		models.DB.Save(&config)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "配置更新成功",
		"data":    config,
	})
}

// 批量更新系统配置
func BatchUpdateSystemConfigs(c *gin.Context) {
	var req struct {
		Configs []struct {
			Key   string `json:"key"`
			Value string `json:"value"`
		} `json:"configs" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	now := feedbackNow()
	for _, cfg := range req.Configs {
		var config models.SystemConfig
		if err := models.DB.Where("key = ?", cfg.Key).First(&config).Error; err != nil {
			config = models.SystemConfig{
				Key:       cfg.Key,
				Value:     cfg.Value,
				CreatedAt: now,
				UpdatedAt: now,
			}
			models.DB.Create(&config)
		} else {
			config.Value = cfg.Value
			config.UpdatedAt = now
			models.DB.Save(&config)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "配置批量更新成功",
	})
}