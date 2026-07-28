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

## 分析流程（必须严格遵守，每一步都要在心里完成后再输出）
重要原则：先客观观察，再做评价。不确定的事情不要瞎说，宁可少说也不要说错。

### 第一步：分别识别两张图的主体（最关键！）
对参考图和用户图分别做以下观察：
1. 画面中最显眼、最吸引注意力的物体/人物是什么？
2. 这个主体大约占画面总面积的百分比是多少？（10%以下=小，10%-30%=中，30%以上=大）
3. 主体是否清晰？有没有被遮挡？
4. 如果画面中有多个元素，按视觉重要性排序：第一主体是什么？第二是什么？

### 第二步：画九宫格确定主体位置（对两张图分别做）
1. 想象画面被 2 横 2 竖平均分成 9 个方格（3×3 网格）
2. 判断第一步识别出的"第一主体"的中心落在哪个区域：
   - 正中央（中间方格）
   - 左上 / 右上 / 左下 / 右下（角落方格）
   - 左中 / 右中 / 上中 / 下中（边缘方格）
3. 主体在水平方向的位置：偏左 / 居中 / 偏右
4. 主体在垂直方向的位置：偏上 / 居中 / 偏下
5. 如果你对位置判断不确定，就用更宽泛的描述（如"大致居中偏左"），不要硬猜精确位置

### 第三步：检查画面平衡与留白
1. 左右两半哪半边视觉重量更大？（考虑明暗、大小、色彩饱和度、物体数量）
2. 上下两半哪半边视觉重量更大？
3. 主体是否占了画面的大部分？如果是，就不要说"画面空旷"
4. 主体朝向的方向是否有足够空间？

### 第四步：检查构图要素
1. 是否有引导线（道路、河流、栏杆、建筑线条）？大致方向？
2. 是否有前景元素？占比多少？
3. 景别判断：特写/近景/中景/全景/远景
4. 地平线/水平线是否明显？是否水平？

### 第五步：对比两张图，给出评分和建议
完成以上四步观察后，再对照评分标准给出每项分数。

### 第六步：自我验证（必须做）
输出前检查：
1. 主体位置描述是否与第二步的九宫格观察一致？（居中就不能写偏左上）
2. 如果主体占画面 30% 以上，就不能写"画面空旷"或"主体不够突出"
3. 每条建议必须基于实际观察到的问题，禁止空泛套话
4. 位置描述宁宽勿窄，不确定就用宽泛描述

## 评分维度（每项满分100分，严格按标准打分）

### 1. 构图 (composition)
专业评判要点：
- 主体突出度：主体是否清晰、是否容易被识别、在画面中的大小占比是否合理（过大显压抑，过小不突出）
- 主体位置：主体在画面中的大致位置（居中/偏左/偏右/偏上/偏下），是否符合该题材的常规构图逻辑
- 画面平衡：左右上下的视觉重量（明暗/大小/色彩）是否均衡，有无明显倾斜
- 视觉引导：是否有引导线、框架、前景元素帮助引导视线
- 留白与呼吸感：主体朝向的一侧是否有适当留白，画面是否显得拥挤或空旷
- 景别与裁切：景别选择是否合理，裁切有无硬伤（切关节/切头顶等）
- 层次与纵深：前景/中景/远景层次是否分明

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
    "具体的优点1（先客观描述画面事实，如"主体在画面中央，占比约30%，清晰突出"，再说明好在哪里）",
    "具体的优点2",
    "具体的优点3",
    "..."
  ],
  
  "suggestions": [
    {
      "dimension": "维度名称（构图/光线/色彩/相似度）",
      "priority": "high" | "medium" | "low",
      "title": "建议标题（用专业术语，一句话概括）",
      "problem": "具体问题描述（先客观描述你在画面中观察到的事实，如"主体位于画面中央区域，约占画面40%面积"，再说明问题是什么。禁止凭空编造位置描述）",
      "analysis": "为什么这是个问题（从摄影原理/视觉心理学角度解释，专业但易懂）",
      "method": "具体改进方法（分步说明，包括机位移动方向和距离、角度调整、参数设置建议、拍摄时机选择、构图调整操作等，越具体越好）",
      "referencePoint": "参考图在这方面是怎么做的（先客观描述参考图的观察结果，再对比说明）"
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
    const compositionIssues = [
      '主体位置可以进一步优化，尝试放在三分线交点处增强视觉吸引力',
      '画面平衡感有待加强，可通过调整机位或取景范围让左右视觉重量更均衡',
      '留白处理可以更讲究，主体朝向一侧适当多留一些空间会更有呼吸感',
      '可以尝试利用前景元素增强画面纵深感，让层次更丰富',
    ];
    const issue = compositionIssues[Math.floor(Math.random() * compositionIssues.length)];
    suggestions.push({
      dimension: '构图',
      priority: composition < 60 ? 'high' : 'medium',
      title: composition < 60 ? '调整构图提升视觉吸引力' : '优化构图细节',
      problem: issue,
      analysis: '构图是摄影的骨架，好的构图能让观众视线快速聚焦到主体上，同时保持画面的平衡感和美感',
      method: '建议拍摄前先打开相机网格线，将主体安排在三分线交点位置；拍摄时尝试水平或垂直翻转画面，对比哪种构图更平衡；注意主体朝向的一侧要留适当空白',
      referencePoint: '参考图的构图经过精心设计，主体位置合理，画面平衡且有呼吸感，值得仔细对比学习',
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
    const colorIssues = [
      '色彩可以更自然柔和，适当降低饱和度会让画面更耐看',
      '白平衡可以微调，让整体色调更加统一和谐',
      '色彩对比可以更讲究，主色与辅色的搭配比例可以更合理',
      '暗部色彩可以提亮一些，增加画面的层次感',
    ];
    const issue = colorIssues[Math.floor(Math.random() * colorIssues.length)];
    const colorMethods = [
      '建议拍摄时先校准白平衡，选择合适的场景模式（日光/阴天/阴影），或使用自定义白平衡',
      '建议后期调整时将饱和度降低 5-10%，让色彩更加自然真实，避免过于刺眼',
      '建议统一画面色调，可通过 HSL 调整将杂色的饱和度降低，使主色更加突出',
    ];
    const method = colorMethods[Math.floor(Math.random() * colorMethods.length)];
    suggestions.push({
      dimension: '色彩',
      priority: color < 60 ? 'high' : 'low',
      title: '优化色彩表现',
      problem: issue,
      analysis: '色彩影响画面情绪表达，准确的白平衡和和谐的配色能让观众感受到正确的情绪氛围',
      method: method,
      referencePoint: '参考图的色彩还原准确，白平衡合适，饱和度适中，整体色调统一和谐',
    });
  }
  
  if (similarity < 80) {
    const simIssues = [
      '与参考图的构图思路还有差异，建议仔细对比机位和景别',
      '光影效果与参考图有差距，可以尝试在相同的光线条件下拍摄',
      '色彩调性与参考图不太一致，后期调色时可以参考对比',
      '关键视觉元素的位置和比例与参考图还有优化空间',
    ];
    const issue = simIssues[Math.floor(Math.random() * simIssues.length)];
    suggestions.push({
      dimension: '相似度',
      priority: similarity < 60 ? 'high' : 'medium',
      title: '提升与参考图的一致性',
      problem: issue,
      analysis: '相似度体现了对参考图的理解和还原能力，对比学习是快速提升摄影水平的有效方法',
      method: '建议将参考图放在旁边对照，先仔细观察参考图的构图特点、光线方向、色彩调性，再从相同的机位和角度重新拍摄，拍好后立即对比找出差异再调整',
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
