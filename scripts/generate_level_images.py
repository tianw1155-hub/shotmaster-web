import os
import sys
import json
import math
import urllib.request
import urllib.parse
from PIL import Image, ImageDraw, ImageFont

UNSPLASH_ACCESS_KEY = "ZbaxbXJ5rbkwdL4Qi-TYfmZxd4iSnKzAnNsRkUgWMEk"
OUTPUT_DIR = "public/images/levels"
RAW_DIR = "public/images/raw"

LEVELS = [
    {"id": 1, "title": "三分法入门", "focus": "三分法则", "search_query": "mountain sunset landscape rule of thirds", "overlay_type": "rule_of_thirds", "label": "三分法构图"},
    {"id": 2, "title": "对称之美", "focus": "对称构图", "search_query": "symmetrical architecture reflection lake", "overlay_type": "symmetry", "label": "对称构图"},
    {"id": 3, "title": "引导线发现", "focus": "引导线", "search_query": "leading lines road forest path", "overlay_type": "leading_lines", "label": "引导线构图"},
    {"id": 4, "title": "框架构图", "focus": "框架", "search_query": "framing photography window arch view", "overlay_type": "frame", "label": "框架构图"},
    {"id": 5, "title": "前景运用", "focus": "前景", "search_query": "foreground bokeh flower landscape depth", "overlay_type": "foreground", "label": "前景构图"},
    {"id": 6, "title": "留白艺术", "focus": "留白", "search_query": "negative space minimalist landscape bird sky", "overlay_type": "negative_space", "label": "留白构图"},
    {"id": 7, "title": "黄金分割", "focus": "黄金比例", "search_query": "golden ratio composition portrait", "overlay_type": "golden_ratio", "label": "黄金分割构图"},
    {"id": 8, "title": "对角线韵律", "focus": "对角线", "search_query": "diagonal lines stairs architecture", "overlay_type": "diagonal", "label": "对角线构图"},
    {"id": 9, "title": "极简入门", "focus": "极简", "search_query": "minimalist photography geometric architecture", "overlay_type": "minimalist", "label": "极简构图"},
    {"id": 10, "title": "构图综合", "focus": "综合构图", "search_query": "epic landscape sunrise composition", "overlay_type": "rule_of_thirds", "label": "综合构图"},
    {"id": 11, "title": "顺光基础", "focus": "顺光", "search_query": "front lighting portrait outdoor", "overlay_type": "front_light", "label": "顺光"},
    {"id": 12, "title": "侧光魅力", "focus": "侧光", "search_query": "side lighting portrait dramatic shadow", "overlay_type": "side_light", "label": "侧光"},
    {"id": 13, "title": "逆光剪影", "focus": "逆光", "search_query": "backlight silhouette sunset person", "overlay_type": "back_light", "label": "逆光剪影"},
    {"id": 14, "title": "柔光质感", "focus": "柔光", "search_query": "soft light portrait window indoor", "overlay_type": "soft_light", "label": "柔光"},
    {"id": 15, "title": "硬光对比", "focus": "硬光", "search_query": "hard light contrast shadow portrait", "overlay_type": "hard_light", "label": "硬光"},
    {"id": 16, "title": "日出日落", "focus": "黄金时刻", "search_query": "golden hour sunset landscape mountains", "overlay_type": "golden_hour", "label": "黄金时刻"},
    {"id": 17, "title": "阴天散射", "focus": "散射光", "search_query": "overcast day portrait soft diffuse light", "overlay_type": "diffused_light", "label": "散射光"},
    {"id": 18, "title": "室内自然光", "focus": "窗光", "search_query": "window light portrait indoor natural", "overlay_type": "window_light", "label": "窗光"},
    {"id": 19, "title": "光线质感", "focus": "光质", "search_query": "light rays forest morning sunbeams", "overlay_type": "light_quality", "label": "光质"},
    {"id": 20, "title": "光影游戏", "focus": "光影", "search_query": "light and shadow pattern architecture", "overlay_type": "light_shadow", "label": "光影"},
    {"id": 21, "title": "暖色调入门", "focus": "暖色", "search_query": "warm colors autumn orange landscape", "overlay_type": "warm_color", "label": "暖色调"},
    {"id": 22, "title": "冷色调入门", "focus": "冷色", "search_query": "cool colors blue winter landscape", "overlay_type": "cool_color", "label": "冷色调"},
    {"id": 23, "title": "对比色冲击", "focus": "对比色", "search_query": "complementary colors vibrant teal orange", "overlay_type": "contrast_color", "label": "对比色"},
    {"id": 24, "title": "邻近色和谐", "focus": "邻近色", "search_query": "analogous colors green nature harmony", "overlay_type": "analogous_color", "label": "邻近色"},
    {"id": 25, "title": "色彩情绪", "focus": "色彩心理", "search_query": "moody color portrait emotional", "overlay_type": "color_mood", "label": "色彩情绪"},
    {"id": 26, "title": "单色美学", "focus": "单色", "search_query": "monochrome black and white portrait", "overlay_type": "monochrome", "label": "单色美学"},
    {"id": 27, "title": "中性灰调", "focus": "灰调", "search_query": "neutral tones gray minimalist portrait", "overlay_type": "neutral_gray", "label": "中性灰调"},
    {"id": 28, "title": "高饱和冲击", "focus": "高饱和", "search_query": "vibrant saturated colors street photography", "overlay_type": "vibrant", "label": "高饱和"},
    {"id": 29, "title": "复古色调", "focus": "复古色", "search_query": "vintage retro film colors portrait", "overlay_type": "vintage", "label": "复古色调"},
    {"id": 30, "title": "色彩综合", "focus": "色彩综合", "search_query": "colorful creative photography artistic", "overlay_type": "color_composition", "label": "色彩综合"},
    {"id": 31, "title": "人像表情", "focus": "人像", "search_query": "natural portrait expression candid", "overlay_type": "portrait", "label": "人像表情"},
    {"id": 32, "title": "风景层次", "focus": "层次", "search_query": "landscape layers foreground middle background", "overlay_type": "layers", "label": "风景层次"},
    {"id": 33, "title": "静物质感", "focus": "质感", "search_query": "still life texture food coffee", "overlay_type": "texture", "label": "静物质感"},
    {"id": 34, "title": "街拍瞬间", "focus": "决定性瞬间", "search_query": "street photography decisive moment candid", "overlay_type": "decisive_moment", "label": "决定性瞬间"},
    {"id": 35, "title": "故事性构图", "focus": "叙事", "search_query": "narrative photography story people street", "overlay_type": "narrative", "label": "叙事构图"},
    {"id": 36, "title": "运动模糊", "focus": "动感", "search_query": "motion blur running speed movement", "overlay_type": "motion_blur", "label": "运动模糊"},
    {"id": 37, "title": "动静对比", "focus": "动静", "search_query": "long exposure water static rocks contrast", "overlay_type": "dynamic_static", "label": "动静对比"},
    {"id": 38, "title": "特写冲击力", "focus": "特写", "search_query": "close up portrait macro detail impact", "overlay_type": "close_up", "label": "特写冲击"},
    {"id": 39, "title": "环境人像", "focus": "环境人像", "search_query": "environmental portrait person landscape", "overlay_type": "environmental_portrait", "label": "环境人像"},
    {"id": 40, "title": "组照思维", "focus": "系列", "search_query": "photo series collection story", "overlay_type": "series", "label": "组照思维"},
    {"id": 41, "title": "夜景入门", "focus": "夜景", "search_query": "night city lights long exposure", "overlay_type": "night", "label": "夜景"},
    {"id": 42, "title": "星空摄影", "focus": "星空", "search_query": "starry night milky way landscape", "overlay_type": "stars", "label": "星空"},
    {"id": 43, "title": "长曝光流水", "focus": "长曝光", "search_query": "long exposure waterfall smooth water", "overlay_type": "long_exposure", "label": "长曝光"},
    {"id": 44, "title": "双重曝光", "focus": "创意", "search_query": "double exposure creative portrait nature", "overlay_type": "double_exposure", "label": "双重曝光"},
    {"id": 45, "title": "人文纪实", "focus": "纪实", "search_query": "documentary photography street people culture", "overlay_type": "documentary", "label": "人文纪实"},
    {"id": 46, "title": "风光大片", "focus": "风光", "search_query": "epic landscape professional mountains sunset", "overlay_type": "epic_landscape", "label": "风光大片"},
    {"id": 47, "title": "时尚人像", "focus": "时尚", "search_query": "fashion portrait editorial magazine style", "overlay_type": "fashion", "label": "时尚人像"},
    {"id": 48, "title": "建筑艺术", "focus": "建筑", "search_query": "architectural photography modern building art", "overlay_type": "architecture", "label": "建筑艺术"},
    {"id": 49, "title": "观念摄影", "focus": "观念", "search_query": "conceptual photography abstract creative art", "overlay_type": "conceptual", "label": "观念摄影"},
    {"id": 50, "title": "大师终极", "focus": "综合", "search_query": "masterpiece photography award winning artistic", "overlay_type": "master", "label": "大师综合"},
]


def download_image(url, save_path):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(save_path, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"下载失败: {e}")
        return False


def search_unsplash(query, per_page=5, orientation="landscape"):
    try:
        url = f"https://api.unsplash.com/search/photos?query={urllib.parse.quote(query)}&per_page={per_page}&orientation={orientation}&client_id={UNSPLASH_ACCESS_KEY}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            return data.get('results', [])
    except Exception as e:
        print(f"搜索失败: {e}")
        return []


def get_font(size):
    font_paths = [
        "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                continue
    return ImageFont.load_default()


def draw_dashed_line(draw, x1, y1, x2, y2, color, width, dash_length=15, gap_length=10):
    dx = x2 - x1
    dy = y2 - y1
    length = math.hypot(dx, dy)
    if length == 0:
        return
    dash_total = dash_length + gap_length
    num_dashes = int(length / dash_total)
    for i in range(num_dashes + 1):
        start_ratio = (i * dash_total) / length
        end_ratio = min((i * dash_total + dash_length) / length, 1.0)
        sx = x1 + dx * start_ratio
        sy = y1 + dy * start_ratio
        ex = x1 + dx * end_ratio
        ey = y1 + dy * end_ratio
        draw.line([(sx, sy), (ex, ey)], fill=color, width=width)


def draw_label(draw, text, x, y, font, anchor="lt"):
    shadow_offset = 2
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    padding = 8
    if anchor == "lt":
        rx, ry = x, y
    elif anchor == "rt":
        rx, ry = x - tw - padding * 2, y
    elif anchor == "lb":
        rx, ry = x, y - th - padding * 2
    elif anchor == "rb":
        rx, ry = x - tw - padding * 2, y - th - padding * 2
    else:
        rx, ry = x, y
    draw.rectangle([rx, ry, rx + tw + padding * 2, ry + th + padding * 2], fill=(0, 0, 0, 80))
    draw.text((rx + padding + shadow_offset, ry + padding + shadow_offset), text, fill=(0, 0, 0, 100), font=font)
    draw.text((rx + padding, ry + padding), text, fill=(255, 255, 255, 240), font=font)


def add_overlay(level, input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    line_color = (255, 255, 255, 200)
    accent_color = (255, 200, 80, 230)
    line_width = max(2, int(min(w, h) / 500))
    label_font_size = int(min(w, h) / 20)
    small_font_size = int(min(w, h) / 28)
    label_font = get_font(label_font_size)
    small_font = get_font(small_font_size)

    otype = level["overlay_type"]
    label = level["label"]

    if otype == "rule_of_thirds":
        tw = w / 3
        th = h / 3
        for i in range(1, 3):
            draw_dashed_line(draw, tw * i, 0, tw * i, h, line_color, line_width)
            draw_dashed_line(draw, 0, th * i, w, th * i, line_color, line_width)
        dot_r = max(4, int(min(w, h) / 150))
        for x in [tw, tw * 2]:
            for y in [th, th * 2]:
                draw.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=accent_color)

    elif otype == "symmetry":
        cx = w / 2
        draw_dashed_line(draw, cx, 0, cx, h, accent_color, line_width + 1)
        draw_dashed_line(draw, 0, h / 2, w, h / 2, line_color, line_width, dash_length=20, gap_length=15)
        draw_label(draw, "主体", int(w * 0.15), int(h * 0.7), small_font)
        draw_label(draw, "主体", int(w * 0.85), int(h * 0.7), small_font, anchor="rt")

    elif otype == "leading_lines":
        draw_dashed_line(draw, 0, h, w * 0.5, h * 0.2, accent_color, line_width + 1)
        draw_dashed_line(draw, w, h, w * 0.5, h * 0.2, accent_color, line_width + 1)
        draw_dashed_line(draw, w * 0.3, h, w * 0.5, h * 0.3, line_color, line_width)
        draw_dashed_line(draw, w * 0.7, h, w * 0.5, h * 0.3, line_color, line_width)
        draw_label(draw, "引导线", int(w * 0.1), int(h * 0.15), small_font)

    elif otype == "frame":
        pad_x = int(w * 0.15)
        pad_y = int(h * 0.15)
        draw_dashed_line(draw, pad_x, pad_y, w - pad_x, pad_y, accent_color, line_width + 1)
        draw_dashed_line(draw, pad_x, h - pad_y, w - pad_x, h - pad_y, accent_color, line_width + 1)
        draw_dashed_line(draw, pad_x, pad_y, pad_x, h - pad_y, accent_color, line_width + 1)
        draw_dashed_line(draw, w - pad_x, pad_y, w - pad_x, h - pad_y, accent_color, line_width + 1)
        draw_label(draw, "框架", int(w * 0.5), int(h * 0.05), small_font, anchor="lt")
        draw_label(draw, "主体", int(w * 0.5), int(h * 0.5), label_font)

    elif otype == "foreground":
        draw_dashed_line(draw, 0, h * 0.65, w, h * 0.65, accent_color, line_width + 1)
        draw_dashed_line(draw, 0, h * 0.3, w, h * 0.3, line_color, line_width)
        draw_label(draw, "前景", int(w * 0.1), int(h * 0.75), small_font)
        draw_label(draw, "主体", int(w * 0.6), int(h * 0.4), small_font)

    elif otype == "negative_space":
        draw.rectangle([int(w * 0.05), int(h * 0.05), int(w * 0.45), int(h * 0.45)], outline=accent_color, width=line_width + 1)
        draw_dashed_line(draw, int(w * 0.05), int(h * 0.05), int(w * 0.45), int(h * 0.05), accent_color, line_width + 1)
        draw_label(draw, "留白", int(w * 0.15), int(h * 0.15), small_font)
        draw_label(draw, "主体", int(w * 0.6), int(h * 0.6), small_font)

    elif otype == "golden_ratio":
        phi = 1.618
        gw = w / phi
        gh = h / phi
        draw_dashed_line(draw, gw, 0, gw, h, line_color, line_width)
        draw_dashed_line(draw, 0, gh, w, gh, line_color, line_width)
        draw_dashed_line(draw, w - gw, 0, w - gw, h, line_color, line_width)
        draw_dashed_line(draw, 0, h - gh, w, h - gh, line_color, line_width)
        steps = 8
        cx, cy = w - gw, gh
        r = gw
        for i in range(steps):
            a1 = (i / steps) * math.pi * 0.5
            a2 = ((i + 1) / steps) * math.pi * 0.5
            x1 = cx + r * math.cos(a1 + math.pi)
            y1 = cy + r * math.sin(a1 + math.pi)
            x2 = cx + r * math.cos(a2 + math.pi)
            y2 = cy + r * math.sin(a2 + math.pi)
            draw.line([(x1, y1), (x2, y2)], fill=accent_color, width=line_width + 1)
        draw_label(draw, "黄金比例", int(w * 0.6), int(h * 0.05), small_font)

    elif otype == "diagonal":
        draw_dashed_line(draw, 0, h, w, 0, accent_color, line_width + 1)
        draw_dashed_line(draw, 0, 0, w, h, line_color, line_width)
        draw_label(draw, "对角线", int(w * 0.7), int(h * 0.15), small_font)

    elif otype == "minimalist":
        cx, cy = w * 0.5, h * 0.4
        r = min(w, h) * 0.15
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent_color, width=line_width + 1)
        draw_label(draw, "极简主体", int(w * 0.5), int(h * 0.7), small_font)

    elif otype == "front_light":
        cx, cy = w * 0.5, h * 0.5
        arrow_len = min(w, h) * 0.15
        draw.line([(cx, cy - arrow_len), (cx, cy)], fill=accent_color, width=line_width + 2)
        draw.polygon([(cx - 8, cy - arrow_len + 15), (cx + 8, cy - arrow_len + 15), (cx, cy - arrow_len)], fill=accent_color)
        draw_label(draw, "光源", int(w * 0.5), int(h * 0.1), small_font)
        draw_label(draw, "顺光: 光源在身后", int(w * 0.05), int(h * 0.05), small_font)

    elif otype == "side_light":
        cy = h * 0.5
        draw_dashed_line(draw, w * 0.1, cy, w * 0.9, cy, accent_color, line_width + 1)
        draw_label(draw, "光源→", int(w * 0.05), int(h * 0.4), small_font)
        draw_label(draw, "侧光: 45度侧光", int(w * 0.05), int(h * 0.05), small_font)

    elif otype == "back_light":
        cx, cy = w * 0.5, h * 0.5
        draw.line([(cx, cy), (cx, cy + min(w, h) * 0.15)], fill=accent_color, width=line_width + 2)
        draw.polygon([(cx - 8, cy + min(w, h) * 0.15 - 15), (cx + 8, cy + min(w, h) * 0.15 - 15), (cx, cy + min(w, h) * 0.15)], fill=accent_color)
        draw_label(draw, "光源在主体后", int(w * 0.5), int(h * 0.05), small_font)
        draw_label(draw, "逆光剪影", int(w * 0.05), int(h * 0.8), label_font)

    elif otype == "soft_light":
        draw_label(draw, "柔光: 均匀漫射", int(w * 0.05), int(h * 0.05), small_font)
        for i in range(5):
            sx = w * 0.2 + i * w * 0.15
            sy = h * 0.2
            draw_dashed_line(draw, sx, sy, sx - w * 0.05, h * 0.7, line_color, line_width)

    elif otype == "hard_light":
        draw_label(draw, "硬光: 明暗对比", int(w * 0.05), int(h * 0.05), small_font)
        draw_dashed_line(draw, w * 0.5, 0, w * 0.5, h, accent_color, line_width + 1)
        draw_label(draw, "亮部", int(w * 0.25), int(h * 0.5), small_font)
        draw_label(draw, "暗部", int(w * 0.75), int(h * 0.5), small_font)

    elif otype == "golden_hour":
        draw_label(draw, "黄金时刻", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "日出/日落前后1小时", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "diffused_light":
        draw_label(draw, "散射光", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "阴天/云层柔化光线", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "window_light":
        draw_label(draw, "窗光", int(w * 0.05), int(h * 0.05), label_font)
        draw_dashed_line(draw, w * 0.1, 0, w * 0.1, h, accent_color, line_width + 1)
        draw_label(draw, "←窗户方向", int(w * 0.15), int(h * 0.5), small_font)

    elif otype == "light_quality":
        draw_label(draw, "光质", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "光线的软硬质感", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "light_shadow":
        draw_label(draw, "光影", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "光影图案营造氛围", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "warm_color":
        draw_label(draw, "暖色调", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "红橙黄为主", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "cool_color":
        draw_label(draw, "冷色调", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "蓝绿紫为主", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "contrast_color":
        draw_label(draw, "对比色", int(w * 0.05), int(h * 0.05), label_font)
        draw_dashed_line(draw, w * 0.5, 0, w * 0.5, h, accent_color, line_width + 1)
        draw_label(draw, "暖色", int(w * 0.2), int(h * 0.5), small_font)
        draw_label(draw, "冷色", int(w * 0.7), int(h * 0.5), small_font)

    elif otype == "analogous_color":
        draw_label(draw, "邻近色", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "色环相邻色和谐搭配", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "color_mood":
        draw_label(draw, "色彩情绪", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "用色彩传达情感", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "monochrome":
        draw_label(draw, "单色美学", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "黑白灰阶调", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "neutral_gray":
        draw_label(draw, "中性灰调", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "低饱和高级感", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "vibrant":
        draw_label(draw, "高饱和", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "色彩鲜艳有冲击力", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "vintage":
        draw_label(draw, "复古色调", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "胶片感怀旧风", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "color_composition":
        draw_label(draw, "色彩综合", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "色彩与构图结合", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "portrait":
        draw_label(draw, "人像表情", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "捕捉自然神态", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "layers":
        draw_dashed_line(draw, 0, h * 0.3, w, h * 0.3, line_color, line_width)
        draw_dashed_line(draw, 0, h * 0.6, w, h * 0.6, accent_color, line_width + 1)
        draw_label(draw, "前景", int(w * 0.1), int(h * 0.75), small_font)
        draw_label(draw, "中景", int(w * 0.1), int(h * 0.45), small_font)
        draw_label(draw, "背景", int(w * 0.1), int(h * 0.1), small_font)

    elif otype == "texture":
        draw_label(draw, "质感表现", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "突出物体材质", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "decisive_moment":
        draw_label(draw, "决定性瞬间", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "捕捉精彩时刻", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "narrative":
        draw_label(draw, "叙事构图", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "画面讲述故事", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "motion_blur":
        cx, cy = w * 0.5, h * 0.5
        for i in range(6):
            offset = i * 15
            draw_dashed_line(draw, cx - 100 - offset, cy - 50, cx + 100 + offset, cy - 50, line_color, line_width)
            draw_dashed_line(draw, cx - 100 - offset, cy + 50, cx + 100 + offset, cy + 50, line_color, line_width)
        draw_label(draw, "运动模糊", int(w * 0.05), int(h * 0.05), label_font)

    elif otype == "dynamic_static":
        draw_dashed_line(draw, w * 0.5, 0, w * 0.5, h, accent_color, line_width + 1)
        draw_label(draw, "动态", int(w * 0.2), int(h * 0.5), small_font)
        draw_label(draw, "静态", int(w * 0.7), int(h * 0.5), small_font)
        draw_label(draw, "动静对比", int(w * 0.05), int(h * 0.05), label_font)

    elif otype == "close_up":
        cx, cy = w * 0.5, h * 0.5
        r = min(w, h) * 0.25
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent_color, width=line_width + 2)
        draw_label(draw, "特写", int(w * 0.05), int(h * 0.05), label_font)

    elif otype == "environmental_portrait":
        draw_dashed_line(draw, w * 0.15, h * 0.2, w * 0.85, h * 0.2, line_color, line_width)
        draw_dashed_line(draw, w * 0.15, h * 0.8, w * 0.85, h * 0.8, line_color, line_width)
        draw_label(draw, "环境", int(w * 0.05), int(h * 0.05), small_font)
        draw_label(draw, "人物+环境融合", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "series":
        draw_label(draw, "组照思维", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "系列照片连贯性", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "night":
        draw_label(draw, "夜景摄影", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "长曝光/高ISO", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "stars":
        draw_label(draw, "星空摄影", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "银河/星轨", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "long_exposure":
        draw_label(draw, "长曝光", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "慢门雾化效果", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "double_exposure":
        draw_label(draw, "双重曝光", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "创意合成效果", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "documentary":
        draw_label(draw, "人文纪实", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "真实记录生活", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "epic_landscape":
        draw_label(draw, "风光大片", int(w * 0.05), int(h * 0.05), label_font)
        tw = w / 3
        th = h / 3
        for i in range(1, 3):
            draw_dashed_line(draw, tw * i, 0, tw * i, h, line_color, line_width)
            draw_dashed_line(draw, 0, th * i, w, th * i, line_color, line_width)
        dot_r = max(4, int(min(w, h) / 150))
        for x in [tw, tw * 2]:
            for y in [th, th * 2]:
                draw.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=accent_color)

    elif otype == "fashion":
        draw_label(draw, "时尚人像", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "杂志级质感", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "architecture":
        draw_label(draw, "建筑艺术", int(w * 0.05), int(h * 0.05), label_font)
        draw_dashed_line(draw, w * 0.3, 0, w * 0.3, h, line_color, line_width)
        draw_dashed_line(draw, w * 0.7, 0, w * 0.7, h, line_color, line_width)
        draw_label(draw, "几何线条美感", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "conceptual":
        draw_label(draw, "观念摄影", int(w * 0.05), int(h * 0.05), label_font)
        draw_label(draw, "表达抽象概念", int(w * 0.05), int(h * 0.85), small_font)

    elif otype == "master":
        draw_label(draw, "大师综合", int(w * 0.05), int(h * 0.05), label_font)
        tw = w / 3
        th = h / 3
        for i in range(1, 3):
            draw_dashed_line(draw, tw * i, 0, tw * i, h, line_color, line_width)
            draw_dashed_line(draw, 0, th * i, w, th * i, line_color, line_width)
        dot_r = max(4, int(min(w, h) / 150))
        for x in [tw, tw * 2]:
            for y in [th, th * 2]:
                draw.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=accent_color)
        draw_label(draw, "综合运用所有技巧", int(w * 0.05), int(h * 0.85), small_font)

    else:
        draw_label(draw, label, int(w * 0.05), int(h * 0.05), label_font)

    # 添加作者信息水印（右下角）
    author_name = level.get("author_name", "")
    if author_name:
        author_font_size = int(min(w, h) / 35)
        author_font = get_font(author_font_size)
        # 右下角添加作者信息
        draw_label(draw, f"📷 {author_name}", int(w * 0.95), int(h * 0.95), author_font, anchor="rb")

    result = Image.alpha_composite(img, overlay)
    result = result.convert("RGB")
    result.save(output_path, "JPEG", quality=90)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(RAW_DIR, exist_ok=True)

    results = []

    for level in LEVELS:
        lid = level["id"]
        print(f"\n=== 处理第 {lid} 关: {level['title']} ===")

        raw_path = os.path.join(RAW_DIR, f"level{lid}.jpg")
        output_path = os.path.join(OUTPUT_DIR, f"level{lid}.jpg")

        if os.path.exists(output_path):
            print(f"  已存在，跳过")
            results.append({"id": lid, "status": "exists", "path": output_path})
            continue

        photos = search_unsplash(level["search_query"])
        if not photos:
            print(f"  搜索失败，尝试备用关键词")
            photos = search_unsplash(level["focus"] + " photography")

        if not photos:
            print(f"  无法获取图片，跳过")
            results.append({"id": lid, "status": "failed", "reason": "no photos"})
            continue

        photo = photos[0]
        photo_url = photo["urls"]["regular"]
        author_name = photo["user"]["name"]
        author_username = photo["user"]["username"]
        author_url = f"https://unsplash.com/@{author_username}"

        print(f"  选择图片: {photo['id']} by {author_name}")

        if not download_image(photo_url, raw_path):
            results.append({"id": lid, "status": "failed", "reason": "download failed"})
            continue

        try:
            add_overlay(level, raw_path, output_path)
            results.append({
                "id": lid,
                "status": "success",
                "path": output_path,
                "author": author_name,
                "authorUrl": author_url,
                "title": level["title"],
            })
            print(f"  成功生成: {output_path}")
        except Exception as e:
            print(f"  生成失败: {e}")
            results.append({"id": lid, "status": "failed", "reason": str(e)})

    success_count = sum(1 for r in results if r["status"] == "success" or r["status"] == "exists")
    print(f"\n\n完成！成功 {success_count}/{len(LEVELS)}")

    with open(os.path.join(OUTPUT_DIR, "results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
