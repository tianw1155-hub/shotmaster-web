package controllers

import (
	"net/http"
	"shotmaster-backend/middleware"
	"shotmaster-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token    string `json:"token"`
	Username string `json:"username"`
}

func AdminLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	var admin models.Admin
	result := models.DB.Where("username = ?", req.Username).First(&admin)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	token, err := middleware.GenerateToken(admin.ID, admin.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成令牌失败"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:    token,
		Username: admin.Username,
	})
}

func GetAdminInfo(c *gin.Context) {
	username, _ := c.Get("username")
	adminID, _ := c.Get("adminId")

	c.JSON(http.StatusOK, gin.H{
		"id":       adminID,
		"username": username,
	})
}
