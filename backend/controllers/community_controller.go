package controllers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"shotmaster-backend/models"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// saveBase64Image 将 base64 图片保存为文件，返回 URL
// 输入格式: data:image/jpeg;base64,/9j/4AAQ...
// 返回: /uploads/community_xxx.jpg
func saveBase64Image(dataURI, prefix string) string {
	if !strings.HasPrefix(dataURI, "data:image/") {
		return dataURI // 已经是 URL，直接返回
	}

	// 解析 data URI
	// 格式: data:image/jpeg;base64,<data>
	commaIdx := strings.Index(dataURI, ",")
	if commaIdx < 0 {
		return dataURI
	}

	header := dataURI[:commaIdx]   // data:image/jpeg;base64
	data := dataURI[commaIdx+1:]   // base64 数据

	// 提取图片格式
	ext := ".jpg"
	if strings.Contains(header, "image/png") {
		ext = ".png"
	} else if strings.Contains(header, "image/webp") {
		ext = ".webp"
	} else if strings.Contains(header, "image/gif") {
		ext = ".gif"
	}

	// 解码 base64
	imgBytes, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		log.Printf("saveBase64Image: base64 decode error: %v", err)
		return dataURI
	}

	// 确保 uploads 目录存在
	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		log.Printf("saveBase64Image: mkdir error: %v", err)
		return dataURI
	}

	// 生成文件名
	filename := fmt.Sprintf("%s_%d%s", prefix, time.Now().UnixNano(), ext)
	filepath := filepath.Join(uploadsDir, filename)

	// 写入文件
	if err := os.WriteFile(filepath, imgBytes, 0644); err != nil {
		log.Printf("saveBase64Image: write file error: %v", err)
		return dataURI
	}

	return "/uploads/" + filename
}

// normalizeEmptyJSONFields 确保作品中的 JSON 数组字段不是空字符串
func normalizeEmptyJSONFields(work *models.CommunityWork) {
	emptyArray := json.RawMessage("[]")
	if len(work.TopAchievements) == 0 || string(work.TopAchievements) == "" {
		work.TopAchievements = emptyArray
	}
	if len(work.TopWorks) == 0 || string(work.TopWorks) == "" {
		work.TopWorks = emptyArray
	}
}

// migrateBase64ToFiles 将作品中的 base64 图片迁移为文件，返回是否需要更新
func migrateBase64ToFiles(work *models.CommunityWork) bool {
	needUpdate := false

	// 迁移 image 字段
	if strings.HasPrefix(work.Image, "data:image/") {
		newURL := saveBase64Image(work.Image, "community_"+work.ID)
		if newURL != work.Image {
			work.Image = newURL
			needUpdate = true
		}
	}

	// 迁移 topWorks 字段（JSON 数组）
	if len(work.TopWorks) > 0 {
		var topWorks []string
		if err := json.Unmarshal(work.TopWorks, &topWorks); err == nil {
			changed := false
			for i, w := range topWorks {
				if strings.HasPrefix(w, "data:image/") {
					newURL := saveBase64Image(w, "community_tw_"+work.ID)
					if newURL != w {
						topWorks[i] = newURL
						changed = true
					}
				}
			}
			if changed {
				if newJSON, err := json.Marshal(topWorks); err == nil {
					work.TopWorks = newJSON
					needUpdate = true
				}
			}
		}
	}

	return needUpdate
}

func GetCommunityWorks(c *gin.Context) {
	var works []models.CommunityWork
	result := models.DB.Order("votes DESC, created_at DESC").Find(&works)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取作品失败"})
		return
	}

	// 自动迁移：将 base64 图片保存为文件，减小 API 响应大小
	for i := range works {
		if migrateBase64ToFiles(&works[i]) {
			models.DB.Model(&works[i]).Updates(map[string]interface{}{
				"image":     works[i].Image,
				"top_works": works[i].TopWorks,
			})
		}
		normalizeEmptyJSONFields(&works[i])
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": works})
}

func SubmitCommunityWork(c *gin.Context) {
	var work models.CommunityWork
	if err := c.ShouldBindJSON(&work); err != nil {
		log.Printf("SubmitCommunityWork ShouldBindJSON error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "参数错误: " + err.Error()})
		return
	}

	if work.ID == "" {
		work.ID = time.Now().Format("20060102150405") + "_" + work.AuthorID
	}
	work.Votes = 0
	work.CreatedAt = time.Now()
	work.UpdatedAt = time.Now()

	// 将 base64 图片保存为文件，数据库存储 URL
	if strings.HasPrefix(work.Image, "data:image/") {
		work.Image = saveBase64Image(work.Image, "community_"+work.ID)
	}

	// 处理 topWorks 数组中的 base64 图片
	if len(work.TopWorks) > 0 {
		var topWorks []string
		if err := json.Unmarshal(work.TopWorks, &topWorks); err == nil {
			for i, w := range topWorks {
				if strings.HasPrefix(w, "data:image/") {
					topWorks[i] = saveBase64Image(w, "community_tw_"+work.ID)
				}
			}
			if newJSON, err := json.Marshal(topWorks); err == nil {
				work.TopWorks = newJSON
			}
		}
	}

	result := models.DB.Create(&work)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "提交失败"})
		return
	}

	normalizeEmptyJSONFields(&work)
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

	normalizeEmptyJSONFields(&work)
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

// MigrateGuestWorks 将游客（authorId='1'）的作品迁移到新注册用户
func MigrateGuestWorks(c *gin.Context) {
	var req struct {
		NewUserID string `json:"newUserId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "参数错误"})
		return
	}

	result := models.DB.Model(&models.CommunityWork{}).
		Where("author_id = ?", "1").
		Update("author_id", req.NewUserID)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "迁移失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "迁移成功",
		"migratedCount": result.RowsAffected,
	})
}
