import { ShootingPlan, Score, GalleryImage, ImageCategory } from '../types';
import { reportAiCall } from './apiService';

// API 配置
const API_URL = import.meta.env.VITE_AGNES_API_URL || 'https://apihub.agnes-ai.com/v1';
const API_KEY = import.meta.env.VITE_AGNES_API_KEY || '';
const MODEL = import.meta.env.VITE_AGNES_MODEL || 'agnes-2.0-flash';

// AI 图片分析结果
export interface ImageAnalysis {
  title: string;           // 中文标题
  description: string;     // 中文描述
  tags: string[];         // 中文标签
  composition: string;      // 构图分析
  lighting: string;        // 光线分析
  color: string;           // 色彩分析
  difficulty: 'beginner' | 'intermediate' | 'advanced';  // 难度评估
}

// AI 服务接口
export interface AIService {
  generateShootingPlan(imageUrl: string, userId?: string): Promise<ShootingPlan>;
  compareImages(referenceUrl: string, userImageUrl: string, userId?: string, category?: string): Promise<Score>;
  analyzeImage(imageUrl: string, category?: ImageCategory, userId?: string): Promise<ImageAnalysis>;
}

// 将图片 URL 转换为 base64
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // 去除 data:image/xxx;base64, 前缀
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    // 如果跨域或失败，返回空字符串
    return '';
  }
}

// 调用 Agnes API 进行图片评分
async function callAgnesAPI(referenceBase64: string, userBase64: string): Promise<Score> {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  const prompt = `你是一位资深摄影导师，擅长从专业角度评价摄影作品并给出可操作的改进建议。

## 任务
请对比以下两张图片：
1. 参考图（教学标准，代表该关卡的优秀水平）
2. 用户作品（学习者的拍摄成果）

请以鼓励和教学的态度进行评价，先肯定做得好的地方，再给出具体的改进建议。

## 评分维度（每项满分100分）

### 1. 构图 (composition)
细致分析要点：
- 主体位置：是否在黄金分割点/三分线等关键位置
- 画面平衡：左右上下的视觉重量是否均衡
- 视觉引导：是否有引导线、框架、前景等引导视线
- 留白与呼吸感：主体周围是否有合适的空间
- 构图法则：是否运用了三分法、对称、引导线、框架构图等
- 层次：前景、中景、远景是否有层次

### 2. 光线 (lighting)
细致分析要点：
- 光线方向：顺光/侧光/逆光/顶光，是否符合主题需要
- 光线质感：硬光还是柔光，是否营造了合适的氛围
- 光影层次：是否有丰富的明暗过渡，还是平光一片
- 高光与暗部：高光是否过曝丢失细节，暗部是否死黑
- 光线氛围：光线是否传达了正确的情绪（温暖/清冷/戏剧等）

### 3. 色彩 (color)
细致分析要点：
- 白平衡：是否偏冷/偏暖，肤色/中性色是否准确
- 色彩饱和度：是否过于鲜艳或过于平淡
- 色彩对比：互补色/邻近色搭配是否和谐
- 色彩统一：整体色调是否统一，有无杂色干扰
- 色彩情感：色彩是否传达了正确的情绪

### 4. 相似度 (similarity)
细致分析要点：
- 构图相似度：主体位置、画面比例、景别是否接近
- 光影相似度：光线方向、明暗对比是否接近
- 色彩相似度：色调、饱和度、白平衡是否接近
- 氛围相似度：整体感觉和情绪是否一致
- 关键元素：参考图中的关键视觉元素是否还原

## 输出要求（严格JSON格式）

{
  "composition": 分数,
  "lighting": 分数,
  "color": 分数,
  "similarity": 分数,
  "overall": 综合总分,
  "stars": 星级(1-3),
  
  "strengths": [
    "做得好的地方1（具体描述，指出是哪个维度的什么优点）",
    "做得好的地方2",
    "..."
  ],
  
  "suggestions": [
    {
      "dimension": "维度名称（构图/光线/色彩/相似度）",
      "priority": "high" | "medium" | "low",
      "title": "建议标题（一句话概括）",
      "problem": "具体问题描述（指出用户作品哪里不好）",
      "analysis": "为什么这是个问题（原理解释）",
      "method": "具体改进方法（怎么操作，包括角度、位置、参数、时机等）",
      "referencePoint": "参考图在这方面是怎么做的"
    }
  ],
  
  "summary": {
    "level": "当前水平评价（一句话，如：构图基础不错，光线把控有待提升）",
    "mainImprovement": "最主要的提升方向（一句话）",
    "nextPractice": "下一步建议练习什么（一句话）",
    "encouragement": "鼓励的话（一句话）"
  },
  
  "quickTips": [
    "快速小贴士1（一句话实用技巧，与这张图相关）",
    "快速小贴士2",
    "快速小贴士3"
  ],
  
  "feedback": ["简洁建议1", "简洁建议2"]
}

## 注意事项
1. 保持4个评分维度不变，但每个维度都要从上述要点进行细致分析
2. 只有需要改进的维度才给出建议，做得好的维度只在strengths中肯定，不给出建议
3. 建议要具体可操作，不能说空话：
   - 不好的："构图不好"
   - 好的："主体偏右约1/5画面，建议向左移动到左侧三分线位置，让视觉重心更稳定"
4. 每条建议都要包含：问题是什么、为什么是问题、怎么改、参考图怎么做的
5. 优先级为high的建议不超过3条，让用户知道先改什么
6. strengths至少3条，善于发现闪光点，即使整体一般也要找到优点
7. quickTips提供3条与这张图相关的实用小技巧，可以是拍摄技巧也可以是后期技巧
8. 语言要像老师对学生说话，专业但不生硬，鼓励为主
9. feedback字段保留，放3-5条最精简的建议，兼容旧版展示`;

  const response = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${referenceBase64}`,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${userBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';

  // 尝试解析 JSON 响应
  try {
    // 提取 JSON（可能在 markdown 代码块中）
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1] || content;
    return JSON.parse(jsonStr.trim());
  } catch {
    // 解析失败，使用 fallback
    throw new Error('Failed to parse API response');
  }
}

// 模拟评分生成（API 失败时的 fallback）
function generateMockScore(): Score {
  const similarity = Math.floor(Math.random() * 25) + 70;
  const composition = Math.floor(Math.random() * 25) + 70;
  const lighting = Math.floor(Math.random() * 25) + 70;
  const color = Math.floor(Math.random() * 25) + 70;
  const overall = Math.round((similarity + composition + lighting + color) / 4);

  let stars: Score['stars'] = 1;
  if (overall >= 90) stars = 3;
  else if (overall >= 75) stars = 2;

  const strengths: string[] = [];
  if (composition >= 80) strengths.push('构图方面做得不错，主体位置把握得当，画面平衡感良好');
  if (lighting >= 80) strengths.push('光线运用合理，光影层次丰富，营造了合适的氛围');
  if (color >= 80) strengths.push('色彩还原准确，白平衡合适，色彩搭配和谐');
  if (similarity >= 80) strengths.push('与参考图整体相似度较高，构图思路基本一致');
  if (strengths.length === 0) strengths.push('敢于尝试就是进步，继续加油！');

  const suggestions: Score['suggestions'] = [];
  
  if (composition < 80) {
    suggestions.push({
      dimension: '构图',
      priority: composition < 60 ? 'high' : 'medium',
      title: '优化主体位置和画面平衡',
      problem: `当前构图得分${composition}分，主体位置偏${Math.random() > 0.5 ? '右' : '左'}，画面${Math.random() > 0.5 ? '上方' : '下方'}略显空旷`,
      analysis: '构图是摄影的骨架，主体位置不当会让观众视线分散，无法快速抓住视觉焦点',
      method: '建议将主体移动到画面的三分线位置，可以尝试向左/右移动约1/5画面距离，同时注意画面上下的视觉平衡',
      referencePoint: '参考图将主体放在左侧三分线位置，右侧留白适当，整体构图稳定且有呼吸感',
    });
  }
  
  if (lighting < 80) {
    suggestions.push({
      dimension: '光线',
      priority: lighting < 60 ? 'high' : 'medium',
      title: '调整光线方向和曝光',
      problem: `当前光线得分${lighting}分，${lighting < 70 ? '高光区域有些过曝，细节丢失较多' : '暗部层次不够丰富，稍显死黑'}`,
      analysis: '光线是摄影的灵魂，过曝会丢失高光细节，欠曝则会让暗部失去层次，影响画面质感',
      method: `${lighting < 70 ? '建议减少曝光补偿0.3-0.7EV，或使用点测光对准高光区域' : '建议增加曝光补偿0.3-0.7EV，或在后期提亮阴影区域'}，注意观察直方图确保高光和暗部都有细节`,
      referencePoint: '参考图的光线控制得当，高光不过曝，暗部有层次，光影过渡自然柔和',
    });
  }
  
  if (color < 80) {
    suggestions.push({
      dimension: '色彩',
      priority: color < 60 ? 'high' : 'low',
      title: '调整白平衡和色彩饱和度',
      problem: `当前色彩得分${color}分，${Math.random() > 0.5 ? '画面整体偏暖，肤色略显偏黄' : '画面饱和度偏高，色彩略显刺眼'}`,
      analysis: '色彩影响画面情绪表达，白平衡不准会导致整体色调偏差，过高的饱和度会让画面显得廉价',
      method: `${Math.random() > 0.5 ? '建议将白平衡调整到5500K左右（日光模式），或在后期降低色温' : '建议降低整体饱和度5-10%，让色彩更加自然柔和'}`,
      referencePoint: '参考图的色彩还原准确，白平衡合适，饱和度适中，整体色调统一和谐',
    });
  }
  
  if (similarity < 80) {
    suggestions.push({
      dimension: '相似度',
      priority: similarity < 60 ? 'high' : 'medium',
      title: '提升与参考图的整体一致性',
      problem: `当前相似度得分${similarity}分，${Math.random() > 0.5 ? '构图思路与参考图差异较大' : '光影效果与参考图差距明显'}`,
      analysis: '相似度体现了对参考图的理解和还原能力，是学习摄影的重要环节',
      method: '建议仔细观察参考图的构图、光线和色彩特点，尝试从相同的机位和角度重新拍摄',
      referencePoint: '参考图在构图、光线和色彩上都有明确的特点，建议重点参考这些方面进行调整',
    });
  }

  const summary: Score['summary'] = {
    level: overall >= 90 ? '优秀！你的摄影水平已经相当不错了' : 
           overall >= 75 ? '良好！构图基础不错，部分维度还有提升空间' :
           overall >= 60 ? '及格！掌握了基本技巧，但需要加强练习' : '需要多加练习，基础还有待巩固',
    mainImprovement: composition < lighting && composition < color && composition < similarity ? '构图' :
                      lighting < color && lighting < similarity ? '光线' :
                      color < similarity ? '色彩' : '相似度',
    nextPractice: '建议多观察优秀作品的构图和光线运用，尝试在不同光线条件下拍摄练习',
    encouragement: overall >= 80 ? '非常棒！继续保持，你已经很接近专业水平了！' :
                   overall >= 60 ? '继续加油！每一次练习都会让你进步！' : '不要气馁，坚持练习，你一定会越来越棒！',
  };

  const quickTips = [
    '拍摄时可以开启网格线，帮助判断三分线位置',
    '逆光拍摄时可以尝试使用点测光，避免主体过暗',
    '调整白平衡时，可以找一个中性灰色参考点',
  ];

  const feedback: string[] = suggestions.map(s => s.title);
  if (feedback.length === 0) feedback.push('整体表现不错，继续保持！');

  return { 
    similarity, 
    composition, 
    lighting, 
    color, 
    overall, 
    stars, 
    feedback,
    strengths,
    suggestions,
    summary,
    quickTips,
  };
}

// 模拟拍摄计划生成
function generateMockShootingPlan(_imageUrl: string): ShootingPlan {
  const scenes = [
    { type: '日出/日落', description: '利用黄金时段柔和的光线，拍摄温暖氛围的画面' },
    { type: '城市建筑', description: '现代建筑的几何美感，注意线条和对称' },
    { type: '自然风光', description: '大自然的壮丽景色，注意前景的层次' },
    { type: '人像写真', description: '捕捉人物神态，注意光线方向和背景虚化' },
    { type: '街拍瞬间', description: '捕捉决定性瞬间，注意故事性和构图' },
  ];
  const scene = scenes[Math.floor(Math.random() * scenes.length)];

  return {
    scene: { type: scene.type, description: scene.description },
    lighting: {
      direction: ['顺光', '侧光', '逆光', '顶光'][Math.floor(Math.random() * 4)],
      quality: ['柔光', '硬光', '混合光'][Math.floor(Math.random() * 3)],
      colorTemp: '5500K-6500K（日光白平衡）',
      suggestion: '建议在日出后或日落前1小时拍摄，光线最柔和',
    },
    composition: {
      rule: ['三分法', '对称构图', '引导线', '框架构图', '黄金螺旋'][Math.floor(Math.random() * 5)],
      details: '将主体放在画面关键位置，注意留白和视觉平衡',
    },
    params: {
      iso: 'ISO 100-400',
      aperture: 'f/2.8 - f/5.6',
      shutter: '1/125s - 1/500s',
    },
    postProcessing: {
      style: ['清新自然', '胶片质感', '电影色调', '日系小清新'][Math.floor(Math.random() * 4)],
      steps: ['适当增加对比度 (+10)', '微调色温偏暖', '降低高光，提亮阴影', '适度增加饱和度'],
    },
    equipment: {
      camera: '手机/微单均可',
      lens: '标准镜头 35-50mm',
      accessories: ['三脚架（可选）', '反光板（人像推荐）'],
    },
  };
}

// Agnes AI 服务实现
export const agnesAIService: AIService = {
  async generateShootingPlan(imageUrl: string, userId?: string): Promise<ShootingPlan> {
    const startTime = Date.now();
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const plan = generateMockShootingPlan(imageUrl);
      reportAiCall({
        userId: userId || '',
        apiType: 'shooting_plan',
        imageUrl,
        durationMs: Date.now() - startTime,
        status: 'mock',
      });
      return plan;
    } catch (error) {
      reportAiCall({
        userId: userId || '',
        apiType: 'shooting_plan',
        imageUrl,
        durationMs: Date.now() - startTime,
        status: 'failed',
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  async compareImages(referenceUrl: string, userImageUrl: string, userId?: string, category?: string): Promise<Score> {
    const startTime = Date.now();
    try {
      const [refBase64, userBase64] = await Promise.all([
        imageUrlToBase64(referenceUrl),
        imageUrlToBase64(userImageUrl),
      ]);

      if (!refBase64 || !userBase64) {
        console.warn('Image conversion failed, using mock score');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const score = generateMockScore();
        reportAiCall({
          userId: userId || '',
          apiType: 'compare_images',
          imageUrl: referenceUrl,
          category,
          durationMs: Date.now() - startTime,
          status: 'mock',
        });
        return score;
      }

      const score = await callAgnesAPI(refBase64, userBase64);
      reportAiCall({
        userId: userId || '',
        apiType: 'compare_images',
        imageUrl: referenceUrl,
        category,
        durationMs: Date.now() - startTime,
        status: 'success',
      });
      return score;
    } catch (error) {
      console.error('Agnes API error:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const score = generateMockScore();
      reportAiCall({
        userId: userId || '',
        apiType: 'compare_images',
        imageUrl: referenceUrl,
        category,
        durationMs: Date.now() - startTime,
        status: 'failed',
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      return score;
    }
  },

  async analyzeImage(imageUrl: string, category?: ImageCategory, userId?: string): Promise<ImageAnalysis> {
    const startTime = Date.now();
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = generateMockImageAnalysis(category);
      reportAiCall({
        userId: userId || '',
        apiType: 'analyze_image',
        imageUrl,
        category,
        durationMs: Date.now() - startTime,
        status: 'mock',
      });
      return result;
    } catch (error) {
      reportAiCall({
        userId: userId || '',
        apiType: 'analyze_image',
        imageUrl,
        category,
        durationMs: Date.now() - startTime,
        status: 'failed',
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};

// 模拟图片分析
function generateMockImageAnalysis(category?: ImageCategory): ImageAnalysis {
  const cat = category || 'landscape';

  const analysisData: Record<string, {
    titles: string[];
    descriptions: string[];
    tags: string[][];
    compositions: string[];
    lightings: string[];
    colors: string[];
    difficulties: ('beginner' | 'intermediate' | 'advanced')[];
  }> = {
    landscape: {
      titles: ['壮阔山景', '静谧湖畔', '云海翻涌', '金色日出', '林间光影'],
      descriptions: ['远处山峰在晨雾中若隐若现', '平静的湖面倒映着天空', '云层在山谷间流动', '阳光穿透云层洒向大地', '阳光透过树叶洒落'],
      tags: [['山脉', '日出', '云雾'], ['湖泊', '倒影', '天空'], ['云海', '山峰', '自然'], ['日出', '阳光', '暖色'], ['森林', '光线', '生命']],
      compositions: ['三分法构图，将山体放在右侧三分线', '对称构图，利用湖面倒影', '引导线构图，山脊线延伸视线', '前景构图，岩石引导视线', '框架构图，树枝作为前景'],
      lightings: ['侧光突出山体轮廓', '漫射光营造柔和氛围', '逆光创造剪影效果', '黄金时段暖色光线', '斑驳光影增加层次'],
      colors: ['蓝灰色调营造宁静感', '暖金色调传递温暖', '绿色为主充满生机', '冷暖对比增强层次', '低饱和度营造氛围'],
      difficulties: ['beginner', 'intermediate', 'intermediate', 'advanced', 'beginner'],
    },
    portrait: {
      titles: ['光影人像', '自然神态', '眸中星辰', '温婉时光', '生动表情'],
      descriptions: ['柔和的光线勾勒出人物轮廓', '自然表情捕捉瞬间', '眼神中透露着故事', '优雅姿态展现气质', '真实情绪的自然流露'],
      tags: [['人像', '光线', '神态'], ['人物', '自然', '抓拍'], ['眼神', '情感', '故事'], ['优雅', '姿态', '气质'], ['表情', '情绪', '真实']],
      compositions: ['中央构图突出主体', '三分法，眼神是关键', '留白构图营造意境', '框架构图聚焦主体', '对角线构图增加动感'],
      lightings: ['窗户光营造柔和氛围', '侧光勾勒轮廓', '逆光发丝光增加魅力', '蝴蝶光正面柔光', '伦勃朗光戏剧效果'],
      colors: ['暖色调传递温馨', '冷色调营造忧郁', '低饱和高级感', '高饱和活力感', '黑白处理聚焦情感'],
      difficulties: ['beginner', 'intermediate', 'advanced', 'beginner', 'intermediate'],
    },
    street: {
      titles: ['街头掠影', '城市故事', '人间烟火', '街角风景', '都市光影'],
      descriptions: ['匆忙的人群中捕捉瞬间', '城市建筑与人的关系', '平凡生活的精彩瞬间', '街角的一抹风景', '霓虹灯下的都市夜景'],
      tags: [['街拍', '人文', '瞬间'], ['城市', '建筑', '关系'], ['生活', '日常', '故事'], ['街角', '建筑', '光影'], ['夜景', '霓虹', '都市']],
      compositions: ['决定性瞬间抓拍', '引导线汇聚视觉焦点', '框架构图利用建筑', '对比构图突出主体', '对称构图建筑美学'],
      lightings: ['自然光记录真实', '窗户光作为光源', '霓虹灯营造氛围', '阴影增加戏剧性', '混合光源增加层次'],
      colors: ['高对比黑白', '霓虹色彩', '暖色生活气息', '冷色都市感', '褪色复古风格'],
      difficulties: ['advanced', 'intermediate', 'beginner', 'intermediate', 'advanced'],
    },
    still: {
      titles: ['静物之美', '光影静物', '美食摄影', '生活美学', '物品叙事'],
      descriptions: ['精心布置的静物组合', '光线穿透玻璃器皿', '美食在阳光下诱人', '日常物品的艺术呈现', '物品讲述无声故事'],
      tags: [['静物', '布置', '组合'], ['玻璃', '光线', '透明'], ['美食', '诱色', '食欲'], ['生活', '日常', '品质'], ['物品', '故事', '叙事']],
      compositions: ['三角形构图稳定', '对角线构图动感', '中央构图聚焦', '散落构图自然', '极简构图留白'],
      lightings: ['侧光突出质感', '逆光勾勒轮廓', '柔光箱均匀照明', '窗户光自然柔和', '硬光制造阴影'],
      colors: ['邻近色和谐', '互补色对比', '单色调极简', '高饱和活力', '低饱和高级'],
      difficulties: ['beginner', 'intermediate', 'beginner', 'intermediate', 'advanced'],
    },
    composition: {
      titles: ['几何之美', '线条艺术', '极简构图', '空间层次', '对称美学'],
      descriptions: ['建筑的几何美感', '线条引导视线', '少即是多的理念', '前景中景远景层次', '镜像对称的秩序感'],
      tags: [['几何', '建筑', '线条'], ['引导线', '延伸', '视觉'], ['极简', '留白', '纯净'], ['空间', '层次', '纵深'], ['对称', '镜像', '秩序']],
      compositions: ['几何形状分割画面', '引导线汇聚焦点', '负空间平衡主体', '三分法安排元素', '黄金比例分割'],
      lightings: ['侧光强调线条', '顶光均匀照明', '阴影制造层次', '逆光勾勒轮廓', '自然光真实还原'],
      colors: ['单色调统一', '对比色突出', '渐变色过渡', '黑白强调结构', '低饱和内敛'],
      difficulties: ['intermediate', 'beginner', 'beginner', 'intermediate', 'advanced'],
    },
    light: {
      titles: ['光影交织', '暮光时刻', '戏剧性光影', '柔和光线', '剪影之美'],
      descriptions: ['明暗对比创造戏剧性', '日落时分的柔和光线', '强光下的戏剧效果', '阴天的均匀柔光', '剪影强调轮廓'],
      tags: [['光影', '明暗', '戏剧'], ['日落', '柔和', '温暖'], ['强光', '对比', '张力'], ['柔光', '阴天', '均匀'], ['剪影', '轮廓', '逆光']],
      compositions: ['明暗分区构图', '光源作为焦点', '影子作为元素', '光线引导视线', '轮廓线条构图'],
      lightings: ['侧光戏剧效果', '顶光均匀但平淡', '逆光剪影', '柔光箱柔和', '自然光真实'],
      colors: ['明暗单色', '暖色光线', '冷暖对比', '金色时刻', '蓝调时刻'],
      difficulties: ['advanced', 'beginner', 'intermediate', 'beginner', 'advanced'],
    },
    color: {
      titles: ['色彩斑斓', '色调叙事', '互补色对比', '柔和色调', '色彩碰撞'],
      descriptions: ['丰富的色彩构成画面', '色彩讲述视觉故事', '红与绿的强烈对比', '低饱和的柔和感', '多色彩的有趣组合'],
      tags: [['色彩', '丰富', '鲜艳'], ['色调', '故事', '情绪'], ['对比', '互补', '红绿'], ['柔和', '低饱和', '温暖'], ['多色', '组合', '活泼']],
      compositions: ['色彩分区构图', '色彩引导视线', '色彩对比聚焦', '色彩平衡画面', '色彩渐变构图'],
      lightings: ['色彩受光线影响', '黄金时刻色彩', '阴天色彩更饱和', '人造光色彩', '自然光真实色彩'],
      colors: ['高饱和鲜艳', '互补色对比', '邻近色和谐', '单色调统一', '中性灰平衡'],
      difficulties: ['intermediate', 'beginner', 'advanced', 'beginner', 'intermediate'],
    },
  };

  const data = analysisData[cat] || analysisData.landscape;
  const idx = Math.floor(Math.random() * data.titles.length);

  return {
    title: data.titles[idx],
    description: data.descriptions[idx],
    tags: data.tags[idx],
    composition: data.compositions[idx],
    lighting: data.lightings[idx],
    color: data.colors[idx],
    difficulty: data.difficulties[idx],
  };
}

// 模拟服务（完全使用模拟数据）
export const mockAIService: AIService = {
  async generateShootingPlan(imageUrl: string, userId?: string): Promise<ShootingPlan> {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1500));
    const plan = generateMockShootingPlan(imageUrl);
    reportAiCall({
      userId: userId || '',
      apiType: 'shooting_plan',
      imageUrl,
      durationMs: Date.now() - startTime,
      status: 'mock',
    });
    return plan;
  },

  async compareImages(referenceUrl: string, userImageUrl: string, userId?: string, category?: string): Promise<Score> {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 2000));
    const score = generateMockScore();
    reportAiCall({
      userId: userId || '',
      apiType: 'compare_images',
      imageUrl: referenceUrl,
      category,
      durationMs: Date.now() - startTime,
      status: 'mock',
    });
    return score;
  },

  async analyzeImage(imageUrl: string, category?: ImageCategory, userId?: string): Promise<ImageAnalysis> {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = generateMockImageAnalysis(category);
    reportAiCall({
      userId: userId || '',
      apiType: 'analyze_image',
      imageUrl,
      category,
      durationMs: Date.now() - startTime,
      status: 'mock',
    });
    return result;
  },
};

// 导出服务实例 - 使用 Agnes API
// 如需切换回模拟数据，改为 export const aiService: AIService = mockAIService;
export const aiService: AIService = agnesAIService;
