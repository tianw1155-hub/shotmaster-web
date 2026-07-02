package controllers

import (
	"net/http"
	"shotmaster-backend/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// 创建评测集
func CreateEvalSet(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Category    string `json:"category"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	evalSet := models.EvalSet{
		Name:        req.Name,
		Description: req.Description,
		Category:    req.Category,
		Status:      "draft",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := models.DB.Create(&evalSet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "评测集创建成功",
		"data":    evalSet,
	})
}

// 获取评测集列表
func GetEvalSets(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	var evalSets []models.EvalSet
	var total int64

	query := models.DB.Model(&models.EvalSet{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&evalSets)

	// 获取每个评测集的图片数量
	for i := range evalSets {
		var imageCount int64
		models.DB.Model(&models.EvalImage{}).Where("eval_set_id = ?", evalSets[i].ID).Count(&imageCount)
		evalSets[i].ImageCount = int(imageCount)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":     evalSets,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// 获取评测集详情
func GetEvalSetDetail(c *gin.Context) {
	id := c.Param("id")

	var evalSet models.EvalSet
	if err := models.DB.First(&evalSet, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评测集不存在"})
		return
	}

	// 获取评测图片列表
	var images []models.EvalImage
	models.DB.Where("eval_set_id = ?", evalSet.ID).Order("created_at DESC").Find(&images)

	evalSet.ImageCount = len(images)

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"evalSet": evalSet,
			"images":  images,
		},
	})
}

// 更新评测集
func UpdateEvalSet(c *gin.Context) {
	id := c.Param("id")

	var evalSet models.EvalSet
	if err := models.DB.First(&evalSet, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评测集不存在"})
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Category    string `json:"category"`
		Status      string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}

	models.DB.Model(&evalSet).Updates(updates)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "评测集更新成功",
		"data":    evalSet,
	})
}

// 删除评测集
func DeleteEvalSet(c *gin.Context) {
	id := c.Param("id")

	var evalSet models.EvalSet
	if err := models.DB.First(&evalSet, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评测集不存在"})
		return
	}

	// 删除关联的图片
	models.DB.Where("eval_set_id = ?", evalSet.ID).Delete(&models.EvalImage{})

	// 删除评测集
	models.DB.Delete(&evalSet)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "评测集删除成功",
	})
}

// 添加评测图片
func AddEvalImage(c *gin.Context) {
	evalSetId := c.Param("id")

	var evalSet models.EvalSet
	if err := models.DB.First(&evalSet, evalSetId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评测集不存在"})
		return
	}

	var req struct {
		ImageUrl    string `json:"imageUrl" binding:"required"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Category    string `json:"category"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	image := models.EvalImage{
		EvalSetId:   evalSet.ID,
		ImageUrl:    req.ImageUrl,
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Status:      "pending",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := models.DB.Create(&image).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "添加失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "图片添加成功",
		"data":    image,
	})
}

// 更新评测图片（标注）
func UpdateEvalImage(c *gin.Context) {
	imageId := c.Param("imageId")

	var image models.EvalImage
	if err := models.DB.First(&image, imageId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "图片不存在"})
		return
	}

	var req struct {
		Title            string `json:"title"`
		Description      string `json:"description"`
		Category         string `json:"category"`
		GroundTruthScene string `json:"groundTruthScene"`
		GroundTruthLight string `json:"groundTruthLight"`
		GroundTruthComp  string `json:"groundTruthComp"`
		GroundTruthParams string `json:"groundTruthParams"`
		GroundTruthPost  string `json:"groundTruthPost"`
		GroundTruthEquip string `json:"groundTruthEquip"`
		Status           string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.GroundTruthScene != "" {
		updates["ground_truth_scene"] = req.GroundTruthScene
	}
	if req.GroundTruthLight != "" {
		updates["ground_truth_light"] = req.GroundTruthLight
	}
	if req.GroundTruthComp != "" {
		updates["ground_truth_comp"] = req.GroundTruthComp
	}
	if req.GroundTruthParams != "" {
		updates["ground_truth_params"] = req.GroundTruthParams
	}
	if req.GroundTruthPost != "" {
		updates["ground_truth_post"] = req.GroundTruthPost
	}
	if req.GroundTruthEquip != "" {
		updates["ground_truth_equip"] = req.GroundTruthEquip
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}

	models.DB.Model(&image).Updates(updates)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "图片更新成功",
		"data":    image,
	})
}

// 删除评测图片
func DeleteEvalImage(c *gin.Context) {
	imageId := c.Param("imageId")

	var image models.EvalImage
	if err := models.DB.First(&image, imageId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "图片不存在"})
		return
	}

	models.DB.Delete(&image)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "图片删除成功",
	})
}

// 获取评测图片列表
func GetEvalImages(c *gin.Context) {
	evalSetId := c.Param("id")
	status := c.Query("status")

	var images []models.EvalImage
	query := models.DB.Where("eval_set_id = ?", evalSetId)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at DESC").Find(&images)

	c.JSON(http.StatusOK, gin.H{
		"data": images,
	})
}