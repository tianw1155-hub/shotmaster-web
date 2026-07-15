package controllers

import (
	"net/http"
	"shotmaster-backend/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ReportAiCall 上报AI调用日志
func ReportAiCall(c *gin.Context) {
	var req struct {
		UserID     string `json:"userId"`
		ApiType    string `json:"apiType"`
		ImageURL   string `json:"imageUrl"`
		Category   string `json:"category"`
		DurationMs int    `json:"durationMs"`
		Status     string `json:"status"`
		ErrorMsg   string `json:"errorMsg"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	now := time.Now().In(shanghaiLocation)
	log := models.AiCallLog{
		UserID:     req.UserID,
		ApiType:    req.ApiType,
		ImageURL:   req.ImageURL,
		Category:   req.Category,
		DurationMs: req.DurationMs,
		Status:     req.Status,
		ErrorMsg:   req.ErrorMsg,
		CreatedAt:  now,
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "上报成功"})
}

// ReportUnsplashCall 上报Unsplash调用日志
func ReportUnsplashCall(c *gin.Context) {
	var req struct {
		UserID      string `json:"userId"`
		Action      string `json:"action"`
		Query       string `json:"query"`
		Category    string `json:"category"`
		ResultCount int    `json:"resultCount"`
		DurationMs  int    `json:"durationMs"`
		Status      string `json:"status"`
		ErrorMsg    string `json:"errorMsg"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	now := time.Now().In(shanghaiLocation)
	log := models.UnsplashCallLog{
		UserID:      req.UserID,
		Action:      req.Action,
		Query:       req.Query,
		Category:    req.Category,
		ResultCount: req.ResultCount,
		DurationMs:  req.DurationMs,
		Status:      req.Status,
		ErrorMsg:    req.ErrorMsg,
		CreatedAt:   now,
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "上报成功"})
}

// ReportPageVisit 上报页面访问日志
func ReportPageVisit(c *gin.Context) {
	var req struct {
		UserID    string `json:"userId"`
		SessionID string `json:"sessionId"`
		Page      string `json:"page"`
		PageTitle string `json:"pageTitle"`
		Referrer  string `json:"referrer"`
		StaySec   int    `json:"staySec"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	now := time.Now().In(shanghaiLocation)
	log := models.PageVisitLog{
		UserID:    req.UserID,
		SessionID: req.SessionID,
		Page:      req.Page,
		PageTitle: req.PageTitle,
		Referrer:  req.Referrer,
		StaySec:   req.StaySec,
		CreatedAt: now,
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "上报成功"})
}

// parseTimeRange 解析时间范围参数
func parseTimeRange(c *gin.Context) (time.Time, time.Time) {
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	var start, end time.Time
	now := time.Now().In(shanghaiLocation)

	if startDate != "" {
		start, _ = time.ParseInLocation("2006-01-02", startDate, shanghaiLocation)
	} else {
		start = now.AddDate(0, 0, -7)
		start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, shanghaiLocation)
	}

	if endDate != "" {
		end, _ = time.ParseInLocation("2006-01-02", endDate, shanghaiLocation)
		end = end.AddDate(0, 0, 1)
	} else {
		end = time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 0, shanghaiLocation).Add(time.Second)
	}

	return start, end
}

// GetAiCallStats AI调用统计
func GetAiCallStats(c *gin.Context) {
	start, end := parseTimeRange(c)

	var totalCount int64
	models.DB.Model(&models.AiCallLog{}).Where("created_at >= ? AND created_at < ?", start, end).Count(&totalCount)

	var successCount int64
	models.DB.Model(&models.AiCallLog{}).Where("created_at >= ? AND created_at < ? AND status = ?", start, end, "success").Count(&successCount)

	var avgDuration float64
	var durations []int
	models.DB.Model(&models.AiCallLog{}).Where("created_at >= ? AND created_at < ?", start, end).Pluck("duration_ms", &durations)
	if len(durations) > 0 {
		var sum int
		for _, d := range durations {
			sum += d
		}
		avgDuration = float64(sum) / float64(len(durations))
	}

	failRate := float64(0)
	if totalCount > 0 {
		failRate = float64(totalCount-successCount) / float64(totalCount) * 100
	}

	type typeCount struct {
		ApiType string `json:"apiType"`
		Count   int64  `json:"count"`
	}
	var typeStats []typeCount
	models.DB.Model(&models.AiCallLog{}).Select("api_type, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("api_type").Scan(&typeStats)

	type dailyStat struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	var dailyStats []dailyStat
	models.DB.Model(&models.AiCallLog{}).Select("DATE_FORMAT(created_at, '%Y-%m-%d') as date, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("date").Order("date").Scan(&dailyStats)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalCount":   totalCount,
			"successCount": successCount,
			"failRate":     failRate,
			"avgDuration":  avgDuration,
			"typeStats":    typeStats,
			"dailyStats":   dailyStats,
		},
	})
}

// GetUnsplashCallStats Unsplash调用统计
func GetUnsplashCallStats(c *gin.Context) {
	start, end := parseTimeRange(c)

	var totalCount int64
	models.DB.Model(&models.UnsplashCallLog{}).Where("created_at >= ? AND created_at < ?", start, end).Count(&totalCount)

	var successCount int64
	models.DB.Model(&models.UnsplashCallLog{}).Where("created_at >= ? AND created_at < ? AND status = ?", start, end, "success").Count(&successCount)

	type actionCount struct {
		Action string `json:"action"`
		Count  int64  `json:"count"`
	}
	var actionStats []actionCount
	models.DB.Model(&models.UnsplashCallLog{}).Select("action, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("action").Scan(&actionStats)

	type categoryCount struct {
		Category string `json:"category"`
		Count    int64  `json:"count"`
	}
	var categoryStats []categoryCount
	models.DB.Model(&models.UnsplashCallLog{}).Select("category, count(*) as count").Where("created_at >= ? AND created_at < ? AND category != ''", start, end).Group("category").Order("count DESC").Limit(10).Scan(&categoryStats)

	type queryCount struct {
		Query string `json:"query"`
		Count int64  `json:"count"`
	}
	var topQueries []queryCount
	models.DB.Model(&models.UnsplashCallLog{}).Select("query, count(*) as count").Where("created_at >= ? AND created_at < ? AND query != ''", start, end).Group("query").Order("count DESC").Limit(10).Scan(&topQueries)

	type dailyStat struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	var dailyStats []dailyStat
	models.DB.Model(&models.UnsplashCallLog{}).Select("DATE_FORMAT(created_at, '%Y-%m-%d') as date, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("date").Order("date").Scan(&dailyStats)

	type statusCount struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	var statusStats []statusCount
	models.DB.Model(&models.UnsplashCallLog{}).Select("status, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("status").Scan(&statusStats)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalCount":    totalCount,
			"successCount":  successCount,
			"actionStats":   actionStats,
			"categoryStats": categoryStats,
			"topQueries":    topQueries,
			"dailyStats":    dailyStats,
			"statusStats":   statusStats,
		},
	})
}

// GetPageVisitStats 用户页面访问统计
func GetPageVisitStats(c *gin.Context) {
	start, end := parseTimeRange(c)

	var totalVisits int64
	models.DB.Model(&models.PageVisitLog{}).Where("created_at >= ? AND created_at < ?", start, end).Count(&totalVisits)

	type pageCount struct {
		Page      string `json:"page"`
		PageTitle string `json:"pageTitle"`
		Count     int64  `json:"count"`
	}
	var pageRankings []pageCount
	models.DB.Model(&models.PageVisitLog{}).Select("page, page_title, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("page, page_title").Order("count DESC").Limit(20).Scan(&pageRankings)

	type hourStat struct {
		Hour  string `json:"hour"`
		Count int64  `json:"count"`
	}
	var hourStats []hourStat
	models.DB.Model(&models.PageVisitLog{}).Select("DATE_FORMAT(created_at, '%H') as hour, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("hour").Order("hour").Scan(&hourStats)

	type dailyStat struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	var dailyStats []dailyStat
	models.DB.Model(&models.PageVisitLog{}).Select("DATE_FORMAT(created_at, '%Y-%m-%d') as date, count(*) as count").Where("created_at >= ? AND created_at < ?", start, end).Group("date").Order("date").Scan(&dailyStats)

	var avgStaySec float64
	var staySecs []int
	models.DB.Model(&models.PageVisitLog{}).Where("created_at >= ? AND created_at < ? AND stay_sec > 0", start, end).Pluck("stay_sec", &staySecs)
	if len(staySecs) > 0 {
		var sum int
		for _, s := range staySecs {
			sum += s
		}
		avgStaySec = float64(sum) / float64(len(staySecs))
	}

	type pageAvgStay struct {
		Page      string  `json:"page"`
		PageTitle string  `json:"pageTitle"`
		AvgStay   float64 `json:"avgStay"`
		Count     int64   `json:"count"`
	}
	var pageAvgStayList []pageAvgStay
	rows, _ := models.DB.Model(&models.PageVisitLog{}).Select("page, page_title, AVG(stay_sec) as avg_stay, count(*) as count").Where("created_at >= ? AND created_at < ? AND stay_sec > 0", start, end).Group("page, page_title").Order("avg_stay DESC").Limit(10).Rows()
	defer rows.Close()
	for rows.Next() {
		var item pageAvgStay
		rows.Scan(&item.Page, &item.PageTitle, &item.AvgStay, &item.Count)
		pageAvgStayList = append(pageAvgStayList, item)
	}

	var sessionCount int64
	models.DB.Model(&models.PageVisitLog{}).Where("created_at >= ? AND created_at < ?", start, end).Distinct("session_id").Count(&sessionCount)

	var avgDepth float64
	if sessionCount > 0 {
		type sessionDepth struct {
			SessionID string
			Depth     int
		}
		rows2, _ := models.DB.Model(&models.PageVisitLog{}).Select("session_id, count(*) as depth").Where("created_at >= ? AND created_at < ?", start, end).Group("session_id").Rows()
		defer rows2.Close()
		var totalDepth int
		var sessCount int
		for rows2.Next() {
			var d sessionDepth
			rows2.Scan(&d.SessionID, &d.Depth)
			totalDepth += d.Depth
			sessCount++
		}
		if sessCount > 0 {
			avgDepth = float64(totalDepth) / float64(sessCount)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalVisits":    totalVisits,
			"sessionCount":   sessionCount,
			"avgStaySec":     avgStaySec,
			"avgDepth":       avgDepth,
			"pageRankings":   pageRankings,
			"hourStats":      hourStats,
			"dailyStats":     dailyStats,
			"pageAvgStayList": pageAvgStayList,
		},
	})
}

// GetAiCallList AI调用日志列表
func GetAiCallList(c *gin.Context) {
	start, end := parseTimeRange(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var total int64
	query := models.DB.Model(&models.AiCallLog{}).Where("created_at >= ? AND created_at < ?", start, end)
	query.Count(&total)

	var list []models.AiCallLog
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"list":     list,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

// GetUnsplashCallList Unsplash调用日志列表
func GetUnsplashCallList(c *gin.Context) {
	start, end := parseTimeRange(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var total int64
	query := models.DB.Model(&models.UnsplashCallLog{}).Where("created_at >= ? AND created_at < ?", start, end)
	query.Count(&total)

	var list []models.UnsplashCallLog
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"list":     list,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

// GetPageVisitList 用户页面访问日志列表
func GetPageVisitList(c *gin.Context) {
	start, end := parseTimeRange(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var total int64
	query := models.DB.Model(&models.PageVisitLog{}).Where("created_at >= ? AND created_at < ?", start, end)
	query.Count(&total)

	var list []models.PageVisitLog
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"list":     list,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}
