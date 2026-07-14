package controllers

import (
	"net/http"
	"regexp"
	"shotmaster-backend/middleware"
	"shotmaster-backend/models"
	"strconv"
	"time"

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

// ============== 普通用户注册/登录 ==============

type UserRegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// validateUserPassword 校验密码强度：长度>=8，包含字母、数字、特殊符号
func validateUserPassword(password string) (bool, string) {
	if len(password) < 8 {
		return false, "密码长度不能少于8位"
	}
	if matched, _ := regexp.MatchString(`[a-zA-Z]`, password); !matched {
		return false, "密码必须包含字母"
	}
	if matched, _ := regexp.MatchString(`[0-9]`, password); !matched {
		return false, "密码必须包含数字"
	}
	if matched, _ := regexp.MatchString(`[^a-zA-Z0-9]`, password); !matched {
		return false, "密码必须包含特殊符号（如 !@#$%^&* 等）"
	}
	return true, ""
}

// UserRegister 普通用户注册
func UserRegister(c *gin.Context) {
	var req UserRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "参数错误"})
		return
	}

	username := req.Username
	// 用户名校验
	if len(username) < 2 || len(username) > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "用户名长度需在2-20字符之间"})
		return
	}

	// 密码强度校验
	if ok, msg := validateUserPassword(req.Password); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": msg})
		return
	}

	// 检查用户名是否已存在
	var existing models.User
	if models.DB.Where("username = ?", username).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "用户名已存在"})
		return
	}

	// 哈希密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "密码加密失败"})
		return
	}

	// 生成用户ID（使用纳秒级时间戳避免冲突）
	now := time.Now().In(shanghaiLocation)
	userID := strconv.FormatInt(now.UnixNano(), 10)

	// 创建用户
	user := models.User{
		ID:         userID,
		Username:   username,
		Password:   string(hashedPassword),
		IsLoggedIn: true,
		IsGuest:    false,
		LastActive: now,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "注册失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "注册成功",
		"userId":  user.ID,
		"username": user.Username,
	})
}

// UserLogin 普通用户登录
func UserLogin(c *gin.Context) {
	var req UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "参数错误"})
		return
	}

	var user models.User
	result := models.DB.Where("username = ? AND password IS NOT NULL", req.Username).Order("id DESC").First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "用户不存在"})
		return
	}

	// 校验密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "密码错误"})
		return
	}

	// 更新登录状态和最后活跃时间
	now := time.Now().In(shanghaiLocation)
	user.IsLoggedIn = true
	user.LastActive = now
	user.UpdatedAt = now
	models.DB.Model(&user).Updates(map[string]interface{}{
		"is_logged_in": true,
		"last_active":  now,
		"updated_at":   now,
	})

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "登录成功",
		"userId":   user.ID,
		"username": user.Username,
		"user": gin.H{
			"id":               user.ID,
			"username":         user.Username,
			"phone":            user.Phone,
			"avatar":           user.Avatar,
			"level":            user.Level,
			"xp":               user.XP,
			"xpToNext":         user.XPToNext,
			"streak":           user.Streak,
			"maxStreak":        user.MaxStreak,
			"totalStars":       user.TotalStars,
			"worksCount":       user.WorksCount,
			"avgScore":         user.AvgScore,
			"followers":        user.Followers,
			"following":        user.Following,
			"isLoggedIn":       true,
			"isGuest":          false,
			"preferences":      user.Preferences,
			"hasCompletedOnboarding": user.HasCompletedOnboarding,
		},
	})
}
