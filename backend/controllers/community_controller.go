package controllers

import (
	"encoding/json"
	"net/http"
	"shotmaster-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

func GetCommunityWorks(c *gin.Context) {
	var works []models.CommunityWork
	result := models.DB.Order("votes DESC, created_at DESC").Find(&works)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取作品失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": works})
}

func SubmitCommunityWork(c *gin.Context) {
	var work models.CommunityWork
	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "参数错误"})
		return
	}

	if work.ID == "" {
		work.ID = time.Now().Format("20060102150405") + "_" + work.AuthorID
	}
	if work.Votes == 0 {
		work.Votes = 0
	}
	work.CreatedAt = time.Now()
	work.UpdatedAt = time.Now()

	result := models.DB.Create(&work)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "提交失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "提交成功", "data": work})
}

func VoteCommunityWork(c *gin.Context) {
	var req struct {
		WorkID string `json:"workId"`
		UserID string `json:"userId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "参数错误"})
		return
	}

	var work models.CommunityWork
	result := models.DB.First(&work, "id = ?", req.WorkID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "作品不存在"})
		return
	}

	var votedBy []string
	if work.VotedBy != "" {
		json.Unmarshal([]byte(work.VotedBy), &votedBy)
	}

	hasVoted := false
	for i, uid := range votedBy {
		if uid == req.UserID {
			votedBy = append(votedBy[:i], votedBy[i+1:]...)
			work.Votes = work.Votes - 1
			hasVoted = true
			break
		}
	}

	if !hasVoted {
		votedBy = append(votedBy, req.UserID)
		work.Votes = work.Votes + 1
	}

	votedByJSON, _ := json.Marshal(votedBy)
	work.VotedBy = string(votedByJSON)
	work.UpdatedAt = time.Now()

	models.DB.Save(&work)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": work})
}

func DeleteCommunityWork(c *gin.Context) {
	workID := c.Param("id")
	result := models.DB.Delete(&models.CommunityWork{}, "id = ?", workID)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}
