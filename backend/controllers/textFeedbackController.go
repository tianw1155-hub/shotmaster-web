package controllers

import (
	"net/http"
	"shotmaster-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

// 用户提交文字反馈
func SubmitTextFeedback(c *gin.Context) {
	var req struct {
		UserID   string `json:"userId" binding:"required"`
		Username string `json:"username"`
		Category string `json:"category"`
		Content  string `json:"content" binding:"required"`
		Contact  string `json:"contact"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	now := time.Now().In(feedbackShanghaiLocation)

	feedback := models.UserTextFeedback{
		UserID:   req.UserID,
		Username: req.Username,
		Category: req.Category,
		Content:  req.Content,
		Contact:  req.Contact,
		Status:   "pending",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := models.DB.Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "提交失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "反馈提交成功",
		"id":      feedback.ID,
	})
}

// 管理后台获取文字反馈列表
func GetTextFeedbackList(c *gin.Context) {
	category := c.Query("category")
	status := c.Query("status")
	startDateStr := c.Query("startDate")
	endDateStr := c.Query("endDate")

	query := models.DB.Model(&models.UserTextFeedback{})

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if startDateStr != "" && endDateStr != "" {
		startDate, err1 := feedbackParseDate(startDateStr)
		endDate, err2 := feedbackParseDate(endDateStr)
		if err1 == nil && err2 == nil {
			endDate = endDate.AddDate(0, 0, 1)
			query = query.Where("created_at >= ? AND created_at < ?", startDate, endDate)
		}
	}

	var feedbacks []models.UserTextFeedback
	query.Order("created_at DESC").Limit(500).Find(&feedbacks)

	// 按分类统计
	categoryCounts := make(map[string]int)
	statusCounts := make(map[string]int)
	for _, fb := range feedbacks {
		if fb.Category != "" {
			categoryCounts[fb.Category]++
		}
		if fb.Status != "" {
			statusCounts[fb.Status]++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":           feedbacks,
		"total":          len(feedbacks),
		"categoryCounts": categoryCounts,
		"statusCounts":   statusCounts,
	})
}

// 管理后台更新反馈状态
func UpdateTextFeedbackStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	var feedback models.UserTextFeedback
	if err := models.DB.First(&feedback, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "反馈不存在"})
		return
	}

	feedback.Status = req.Status
	feedback.UpdatedAt = time.Now().In(feedbackShanghaiLocation)
	models.DB.Save(&feedback)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "状态更新成功",
	})
}
