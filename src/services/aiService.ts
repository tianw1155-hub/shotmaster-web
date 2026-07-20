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

  const prompt = `你是一位拥有20年经验的资深摄影导师，精通风光、人像、街拍等各类题材，曾在专业摄影杂志担任图片编辑。你的评价以专业、精准、可操作著称，能够从细微处发现问题并给出明确的改进方案。

## 任务
请对比以下两张图片：
1. 参考图（教学标准，代表该关卡的优秀水平）
2. 用户作品（学习者的拍摄成果）

请以专业导师的态度进行评价，先肯定做得好的地方，再给出具体可操作的改进建议。

## 分析流程（必须严格遵守）
在给出评分和建议前，先在心里完成以下观察分析：
1. 仔细观察参考图：主体是什么？构图方式？光线方向？色彩调性？关键视觉元素有哪些？
2. 仔细观察用户图：主体是什么？与参考图的差异在哪里？
3. 逐项对比4个维度，找出具体差异点
4. 基于差异给出分数和建议

## 评分维度（每项满分100分，严格按标准打分）

### 1. 构图 (composition)
专业评判要点：
- 主体位置：是否落在黄金分割点（φ≈0.618）或三分线交点上
- 画面平衡：左右上下的视觉重量（明暗/大小/色彩）是否均衡，有无倾斜
- 视觉引导：是否有引导线（道路/河流/建筑线条）、框架（门窗/树枝）、前景元素引导视线到主体
- 留白与呼吸感：主体朝向的一侧是否有足够留白（运动方向留白、视线方向留白）
- 景别与裁切：是特写/近景/中景/全景/远景？裁切是否合理，有无切关节/切头顶等问题
- 层次与纵深：前景/中景/远景三层是否分明，空间纵深感如何
- 地平线/水平线：是否水平，位置是否在上三分/下三分线

### 2. 光线 (lighting)
专业评判要点：
- 光线方向：顺光/前侧光/侧光/侧逆光/逆光/顶光，是否适合该题材
- 光线质感：硬光（阴影边界清晰）还是柔光（阴影过渡柔和），是否符合主题氛围
- 光比与反差：明暗对比是高反差/中反差/低反差，是否有细节丢失
- 曝光准确性：直方图是否合理，高光有无"死白"（clipping），暗部有无"死黑"，中间调层次是否丰富
- 光影塑形：光线是否塑造了主体的立体感和质感，有无伦勃朗光、蝴蝶光等经典布光特征
- 光线时机：是否是黄金时段（日出后/日落前1小时）、蓝调时段，光线角度是否理想

### 3. 色彩 (color)
专业评判要点：
- 白平衡与色温：白平衡是否准确，偏暖/偏冷多少K，肤色/白墙是否正常
- 曝光与色彩：过曝导致色彩褪色，欠曝导致色彩暗沉
- 色彩饱和度与明度：是高饱和/中饱和/低饱和（莫兰迪/日系），是否统一
- 色彩搭配：主色/辅色/点缀色比例是否合理（推荐6:3:1），互补色/邻近色/同类色搭配是否和谐
- 色彩统一度：整体色调是否统一，有无杂色（如电线杆、垃圾桶等破坏色调的元素）
- 色彩情感：暖色调（温暖/热情）、冷色调（宁静/清冷）、对比色（张力/活力）是否传达了正确的情绪

### 4. 相似度 (similarity)
专业评判要点：
- 构图相似度：机位高度（俯视/平视/仰视）、拍摄距离（景别）、主体位置、画面比例是否接近
- 光影相似度：光线方向、光比大小、明暗分布、阴影方向是否接近
- 色彩相似度：色温、饱和度、色调倾向、对比度是否接近
- 关键元素还原：参考图中的关键视觉元素（人物/建筑/道具/前景/背景）是否在相似位置出现
- 氛围相似度：整体情绪、氛围感、画面节奏是否一致

## 输出要求（严格JSON格式）

{
  "composition": 分数,
  "lighting": 分数,
  "color": 分数,
  "similarity": 分数,
  "overall": 综合总分,
  "stars": 星级(1-3),
  
  "strengths": [
    "具体的优点1（必须指出画面中具体的位置/元素/效果，以及为什么好）",
    "具体的优点2",
    "具体的优点3",
    "..."
  ],
  
  "suggestions": [
    {
      "dimension": "维度名称（构图/光线/色彩/相似度）",
      "priority": "high" | "medium" | "low",
      "title": "建议标题（用专业术语，一句话概括）",
      "problem": "具体问题描述（指出用户作品中哪个位置、什么元素、有什么问题，用百分比/位置关系量化）",
      "analysis": "为什么这是个问题（从摄影原理/视觉心理学角度解释，专业但易懂）",
      "method": "具体改进方法（分步说明，包括机位移动方向和距离、角度调整、参数设置建议、拍摄时机选择、构图调整操作等，越具体越好）",
      "referencePoint": "参考图在这方面是怎么做的（具体描述参考图的处理方式，对比说明）"
    }
  ],
  
  "summary": {
    "level": "当前水平评价（一句话，专业评价，如：构图有基础但光线把控不足，整体处于入门进阶阶段）",
    "mainImprovement": "最主要的提升方向（一句话，指出核心问题）",
    "nextPractice": "下一步建议练习什么（一句话，给出具体的练习方法）",
    "encouragement": "鼓励的话（一句话，真诚不空洞）"
  },
  
  "quickTips": [
    "专业小技巧1（与这张图直接相关，具体可操作，如：拍摄前先观察光线方向，让主体受光面朝向镜头）",
    "专业小技巧2",
    "专业小技巧3"
  ],
  
  "feedback": ["简洁专业建议1", "简洁专业建议2", "简洁专业建议3"]
}

## 专业要求（必须遵守）
1. **禁止空话套话**：所有评价必须具体到画面中的元素和位置
   - 不好的："构图不好"
   - 好的："主体位于画面正中央偏左约1/10处，偏离左侧三分线约15%，视觉重心偏左"

2. **建议必须可操作**：给出具体的操作步骤和参数
   - 不好的："调整一下构图"
   - 好的："建议向右平移机位约30厘米，同时略微抬高拍摄角度（约15度），使主体落在左上三分线交点处，前景绿植占比约1/3"

3. **使用专业术语但要解释**：可以用专业词汇（光比、景别、留白、视觉重量等），但要结合具体画面说明

4. **strenghts至少4条**：善于发现优点，从不同维度找闪光点，即使整体一般也要找到具体值得肯定的地方

5. **suggestions数量3-5条**：其中high优先级1-2条，medium优先级1-2条，low优先级0-1条，按优先级排序

6. **quickTips必须实用**：3条真正有用的摄影技巧，与这张图的问题直接相关，不能是常识性废话

7. **评分要客观**：
   - 90分以上：专业级水平，几乎无可挑剔
   - 80-89分：优秀，有小问题但整体很好
   - 70-79分：良好，有明显优点也有明显不足
   - 60-69分：及格，基础有了但各方面都有待提升
   - 60分以下：需要大量练习，基础薄弱

8. **对比分析**：每条建议都要对比参考图，说明参考图是怎么做的，为什么那样更好

9. **语言风格**：像一位严格但有耐心的专业老师，专业但不傲慢，指出问题一针见血，给出建议清晰明了`;

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
      max_tokens: 5000,
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
  if (composition >= 80) strengths.push('构图基本功扎实，主体位置把控精准，落在画面三分线交点附近，视觉焦点明确');
  if (composition >= 70 && composition < 80) strengths.push('构图有章法，主体位置大致合理，画面基本平衡');
  if (lighting >= 80) strengths.push('光线运用出色，光影层次丰富，明暗过渡自然，主体立体感强');
  if (lighting >= 70 && lighting < 80) strengths.push('光线把握不错，曝光基本准确，整体亮度适中');
  if (color >= 80) strengths.push('色彩表现优秀，白平衡准确，色调统一和谐，色彩搭配有美感');
  if (color >= 70 && color < 80) strengths.push('色彩基本准确，整体色调协调，没有明显偏色');
  if (similarity >= 80) strengths.push('与参考图还原度高，构图思路和光影效果都把握得很到位，学习能力强');
  if (similarity >= 70 && similarity < 80) strengths.push('对参考图的理解不错，核心元素基本还原');
  if (composition < 70 || lighting < 70 || color < 70 || similarity < 70) {
    strengths.push('敢于实践就是最好的开始，每一次拍摄都是积累经验的过程');
  }
  if (strengths.length < 4) {
    if (composition >= 60) strengths.push('构图意识已经建立，继续练习会更快提升');
    if (lighting >= 60) strengths.push('对光线有基本感知，知道观察光线方向');
    if (color >= 60) strengths.push('色彩感觉不错，没有过度后期的痕迹');
    if (strengths.length < 4) strengths.push('拍摄态度认真，愿意对比学习就是进步的关键');
  }

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
