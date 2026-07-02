package middleware

import (
	"net/http"
	"shotmaster-backend/config"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	AdminID  uint   `json:"adminId"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(adminID uint, username string) (string, error) {
	expireHours := 24
	claims := Claims{
		AdminID:  adminID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "shotmaster-admin",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "未提供认证令牌"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "认证令牌格式错误"})
			c.Abort()
			return
		}

		tokenStr := parts[1]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "认证令牌无效或已过期"})
			c.Abort()
			return
		}

		c.Set("adminId", claims.AdminID)
		c.Set("username", claims.Username)
		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
