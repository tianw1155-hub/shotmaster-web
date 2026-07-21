package models

import (
	"encoding/json"
	"time"
)

// 管理员
type Admin struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// 用户
type User struct {
	ID          string    `gorm:"primaryKey;size:100" json:"id"`
	Username    string    `gorm:"size:50;uniqueIndex" json:"username"`
	Password    string    `gorm:"size:255" json:"-"` // bcrypt哈希密码，不返回给前端
	Phone       string    `gorm:"size:20" json:"phone"`
	Avatar      string    `gorm:"size:255" json:"avatar"`
	Level       int       `json:"level"`
	XP          int       `json:"xp"`
	XPToNext    int       `json:"xpToNext"`
	Streak      int       `json:"streak"`
	MaxStreak   int       `json:"maxStreak"`
	TotalStars  int       `json:"totalStars"`
	WorksCount  int       `json:"worksCount"`
	AvgScore    float64   `json:"avgScore"`
	Followers   int       `json:"followers"`   // 粉丝数
	Following   int       `json:"following"`   // 关注数
	IsLoggedIn  bool      `json:"isLoggedIn"`
	IsGuest     bool      `json:"isGuest"`
	HasCompletedOnboarding bool   `json:"hasCompletedOnboarding"`
	Preferences string    `gorm:"type:text" json:"preferences"` // JSON数组
	LastActive  time.Time `json:"lastActive"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// 用户关注记录
type UserFollow struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	FollowerID string    `gorm:"size:100;index" json:"followerId"` // 发起关注的用户
	TargetID   string    `gorm:"size:100;index" json:"targetId"`   // 被关注的用户
	CreatedAt  time.Time `json:"createdAt"`
}

// 用户拍摄计划维度反馈
type ShootingPlanFeedback struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    string    `gorm:"size:100;index" json:"userId"`
	ImageID   string    `gorm:"size:100;index" json:"imageId"`
	ImageURL  string    `gorm:"size:500" json:"imageUrl"`
	ImageTitle string   `gorm:"size:100" json:"imageTitle"`
	Category  string    `gorm:"size:20;index" json:"category"`
	Dimension string    `gorm:"size:20;index" json:"dimension"` // scene/lighting/composition/params/postProcessing/equipment
	Liked     bool      `json:"liked"`
	Disliked  bool      `json:"disliked"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// 用户评图建议反馈
type ScoreSuggestionFeedback struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          string    `gorm:"size:100;index" json:"userId"`
	ScoreID         string    `gorm:"size:100;index" json:"scoreId"`
	SuggestionKey   string    `gorm:"size:200;index" json:"suggestionKey"`
	SuggestionTitle string    `gorm:"size:200" json:"suggestionTitle"`
	Dimension       string    `gorm:"size:50;index" json:"dimension"`
	Liked           bool      `json:"liked"`
	Disliked        bool      `json:"disliked"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// 用户文字反馈
type UserTextFeedback struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    string    `gorm:"size:100;index" json:"userId"`
	Username  string    `gorm:"size:50" json:"username"`
	Category  string    `gorm:"size:30;index" json:"category"` // bug/suggestion/question/praise/other
	Content   string    `gorm:"type:text;not null" json:"content"`
	Contact   string    `gorm:"size:100" json:"contact"`
	Status    string    `gorm:"size:20;default:'pending';index" json:"status"` // pending/processing/resolved
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// 评测集
type EvalSet struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Category    string    `gorm:"size:20" json:"category"`
	Status      string    `gorm:"size:20;default:'draft'" json:"status"` // draft/active/archived
	ImageCount  int       `json:"imageCount"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// 评测图片（AI评图评测 - 带人工标注Ground Truth）
type EvalImage struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	EvalSetId        uint      `gorm:"index" json:"evalSetId"`
	ImageUrl         string    `gorm:"size:500;not null" json:"imageUrl"`
	Title            string    `gorm:"size:100" json:"title"`
	Description      string    `gorm:"type:text" json:"description"`
	Category         string    `gorm:"size:20;index" json:"category"`
	Status           string    `gorm:"size:20;default:'pending'" json:"status"` // pending/annotated/reviewed
	// Ground Truth 标注（AI评图评测）
	GTCompositionScore int       `gorm:"default:0" json:"gtCompositionScore"` // 构图评分 0-100
	GTLightingScore    int       `gorm:"default:0" json:"gtLightingScore"`    // 光线评分 0-100
	GTColorScore       int       `gorm:"default:0" json:"gtColorScore"`       // 色彩评分 0-100
	GTOverallScore     int       `gorm:"default:0" json:"gtOverallScore"`     // 整体评分 0-100
	GTStars            int       `gorm:"default:1" json:"gtStars"`            // 推荐星级 1-3
	GTPros             string    `gorm:"type:text" json:"gtPros"`             // 主要优点 JSON数组
	GTProblems         string    `gorm:"type:text" json:"gtProblems"`         // 主要问题 JSON数组
	GTSuggestions      string    `gorm:"type:text" json:"gtSuggestions"`      // 改进建议 JSON数组
	GTIsHarmful        bool      `gorm:"default:false" json:"gtIsHarmful"`    // 是否有害内容
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// AI评测任务
type EvaluationJob struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	SetID         uint      `gorm:"index" json:"setId"`
	SetName       string    `gorm:"size:100" json:"setName"`
	ModelVersion  string    `gorm:"size:50" json:"modelVersion"`
	Status        string    `gorm:"size:20;index" json:"status"` // pending/running/completed/failed
	TotalImages   int       `json:"totalImages"`
	ProcessedImages int     `json:"processedImages"`
	Accuracy      float64   `json:"accuracy"`
	F1Score       float64   `json:"f1Score"`
	Precision     float64   `json:"precision"`
	Recall        float64   `json:"recall"`
	Groundedness  float64   `json:"groundedness"`
	DescQuality   float64   `json:"descQuality"`
	ErrorMsg      string    `gorm:"type:text" json:"errorMsg"`
	CreatedAt     time.Time `json:"createdAt"`
	CompletedAt   *time.Time `json:"completedAt"`
}

// AI评测结果明细
type EvaluationResult struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	JobID           uint      `gorm:"index" json:"jobId"`
	ImageID         uint      `gorm:"index" json:"imageId"`
	ImageURL        string    `gorm:"size:500" json:"imageUrl"`
	// 人工标注（Ground Truth）
	GTComposition   string    `gorm:"size:30" json:"gtComposition"`
	GTLighting      string    `gorm:"size:30" json:"gtLighting"`
	GTColorTone     string    `gorm:"size:30" json:"gtColorTone"`
	// AI输出
	AIComposition   string    `gorm:"size:30" json:"aiComposition"`
	AILighting      string    `gorm:"size:30" json:"aiLighting"`
	AIColorTone     string    `gorm:"size:30" json:"aiColorTone"`
	AIDescription   string    `gorm:"type:text" json:"aiDescription"`
	// 单图评分
	CompositionCorrect bool   `json:"compositionCorrect"`
	LightingCorrect    bool   `json:"lightingCorrect"`
	ColorToneCorrect   bool   `json:"colorToneCorrect"`
	Grounded           bool   `json:"grounded"`
	DescQualityScore   int    `json:"descQualityScore"` // 1-5
	CreatedAt          time.Time `json:"createdAt"`
}

// 系统配置
type SystemConfig struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ConfigKey string    `gorm:"column:config_key;uniqueIndex;size:100;not null" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	Remark    string    `gorm:"size:255" json:"remark"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// 用户行为记录（用于统计）
type UserAction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    string    `gorm:"size:100;index" json:"userId"`
	Action    string    `gorm:"size:50;index" json:"action"` // view_image/score_image/complete_level/...
	TargetID  string    `gorm:"size:100" json:"targetId"`
	Category  string    `gorm:"size:20" json:"category"`
	Detail    string    `gorm:"type:text" json:"detail"`
	CreatedAt time.Time `json:"createdAt"`
}

// 拍摄建议缓存（AI生成的拍摄计划，按图片URL缓存）
type ShootingPlanCache struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ImageHash string    `gorm:"uniqueIndex;size:64;not null" json:"imageHash"` // 图片URL的hash
	ImageURL  string    `gorm:"size:500" json:"imageUrl"`
	Category  string    `gorm:"size:20;index" json:"category"`
	// 拍摄计划 JSON
	Scene          string `gorm:"type:text" json:"scene"`
	Lighting       string `gorm:"type:text" json:"lighting"`
	Composition    string `gorm:"type:text" json:"composition"`
	Params         string `gorm:"type:text" json:"params"`
	PostProcessing string `gorm:"type:text" json:"postProcessing"`
	Equipment      string `gorm:"type:text" json:"equipment"`
	ShootingIdea   string `gorm:"type:text" json:"shootingIdea"`
	CommonMistakes string `gorm:"type:text" json:"commonMistakes"` // JSON数组
	HitCount       int    `gorm:"default:1" json:"hitCount"`       // 命中次数
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// AI调用日志
type AiCallLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     string    `gorm:"size:100;index" json:"userId"`
	ApiType    string    `gorm:"size:30;index" json:"apiType"` // compare_images/analyze_image/shooting_plan
	ImageURL   string    `gorm:"size:500" json:"imageUrl"`
	Category   string    `gorm:"size:20;index" json:"category"`
	DurationMs int       `json:"durationMs"`
	Status     string    `gorm:"size:20;index" json:"status"` // success/failed/mock
	ErrorMsg   string    `gorm:"type:text" json:"errorMsg"`
	CreatedAt  time.Time `gorm:"index" json:"createdAt"`
}

// Unsplash调用日志
type UnsplashCallLog struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      string    `gorm:"size:100;index" json:"userId"`
	Action      string    `gorm:"size:30;index" json:"action"` // search/fetch_by_category/fetch_by_preferences/weekly_challenge
	Query       string    `gorm:"size:200" json:"query"`
	Category    string    `gorm:"size:20;index" json:"category"`
	ResultCount int       `json:"resultCount"`
	DurationMs  int       `json:"durationMs"`
	Status      string    `gorm:"size:20;index" json:"status"` // success/failed/no_key
	ErrorMsg    string    `gorm:"type:text" json:"errorMsg"`
	CreatedAt   time.Time `gorm:"index" json:"createdAt"`
}

// 用户页面访问日志
type PageVisitLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    string    `gorm:"size:100;index" json:"userId"`
	SessionID string    `gorm:"size:100;index" json:"sessionId"` // 会话ID，用于计算访问深度
	Page      string    `gorm:"size:200;index" json:"page"`    // 页面路径，如 /gallery
	PageTitle string    `gorm:"size:100" json:"pageTitle"`      // 页面标题
	Referrer  string    `gorm:"size:200" json:"referrer"`       // 来源页面
	StaySec   int       `json:"staySec"`                        // 停留时长（秒）
	CreatedAt time.Time `gorm:"index" json:"createdAt"`
}

// 社区挑战作品
type CommunityWork struct {
	ID                  string    `gorm:"primaryKey;size:100" json:"id"`
	AuthorID            string    `gorm:"size:100;index" json:"authorId"`
	Author              string    `gorm:"size:50" json:"author"`
	Avatar              string    `gorm:"size:255" json:"avatar"`
	AuthorLevel         int       `json:"authorLevel"`
	AuthorStars         int       `json:"authorStars"`
	AuthorCompletedCount int      `json:"authorCompletedCount"`
	AuthorStreak        int       `json:"authorStreak"`
	AuthorFollowers     int       `json:"authorFollowers"`
	AuthorFollowing     int       `json:"authorFollowing"`
	TopAchievements     json.RawMessage `gorm:"type:text" json:"topAchievements"`
	TopWorks            json.RawMessage `gorm:"type:longtext" json:"topWorks"`
	Image               string    `gorm:"type:longtext" json:"image"`
	Votes               int       `json:"votes"`
	VotedBy             string    `gorm:"type:text" json:"votedBy"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}
