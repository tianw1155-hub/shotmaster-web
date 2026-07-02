package controllers

import (
	"net/http"
	"shotmaster-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

// 获取反馈分析详情
func GetFeedbackAnalysis(c *gin.Context) {
	dimension := c.Query("dimension")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	var feedbacks []models.ShootingPlanFeedback
	query := models.DB.Model(&models.ShootingPlanFeedback{})

	if startDate != "" && endDate != "" {
		query = query.Where("created_at BETWEEN ? AND ?", startDate, endDate)
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

	for i := 6; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i).Format("2006-01-02")

		var likedCount, dislikedCount int64
		models.DB.Model(&models.ShootingPlanFeedback{}).
			Where("DATE(created_at) = ? AND liked = ?", date, true).
			Count(&likedCount)
		models.DB.Model(&models.ShootingPlanFeedback{}).
			Where("DATE(created_at) = ? AND disliked = ?", date, true).
			Count(&dislikedCount)

		trendData = append(trendData, gin.H{
			"date":     date,
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
			Key:   key,
			CreatedAt: time.Now(),
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
	config.UpdatedAt = time.Now()

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

	for _, cfg := range req.Configs {
		var config models.SystemConfig
		if err := models.DB.Where("key = ?", cfg.Key).First(&config).Error; err != nil {
			config = models.SystemConfig{
				Key:   cfg.Key,
				Value: cfg.Value,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			models.DB.Create(&config)
		} else {
			config.Value = cfg.Value
			config.UpdatedAt = time.Now()
			models.DB.Save(&config)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "配置批量更新成功",
	})
}