#!/usr/bin/env python3
"""为已生成的关卡图片添加作者水印"""

import os
import json
from PIL import Image, ImageDraw, ImageFont

# 作者信息映射
AUTHORS = {
    1: {"name": "Sven Pieren", "url": "https://unsplash.com/@sven_pieren"},
    2: {"name": "Michael", "url": "https://unsplash.com/@michael75"},
    3: {"name": "Geranimo", "url": "https://unsplash.com/@geraninmo"},
    4: {"name": "Zoshua Colah", "url": "https://unsplash.com/@zoshuacolah"},
    5: {"name": "Bruce Kee", "url": "https://unsplash.com/@brucekee"},
    6: {"name": "Javier Garcia Chavez", "url": "https://unsplash.com/@javchz"},
    7: {"name": "Rachel McDermott", "url": "https://unsplash.com/@mrsrachelmcdermott"},
    8: {"name": "Rubén García", "url": "https://unsplash.com/@rubengargar"},
    9: {"name": "Tristan B.", "url": "https://unsplash.com/@floudeciel"},
    10: {"name": "Dawid Zawiła", "url": "https://unsplash.com/@davealmine"},
    11: {"name": "Amin Oussar", "url": "https://unsplash.com/@oussar"},
    12: {"name": "Andras Vas", "url": "https://unsplash.com/@wasdrew"},
    13: {"name": "Sasha Freemind", "url": "https://unsplash.com/@sashafreemind"},
    14: {"name": "Marius Muresan", "url": "https://unsplash.com/@muresan113"},
    15: {"name": "Andras Vas", "url": "https://unsplash.com/@wasdrew"},
    16: {"name": "Sven Pieren", "url": "https://unsplash.com/@sven_pieren"},
    17: {"name": "Krzysztof Kowalik", "url": "https://unsplash.com/@kowalikus"},
    18: {"name": "Marius Muresan", "url": "https://unsplash.com/@muresan113"},
    19: {"name": "Erik van Dijk", "url": "https://unsplash.com/@erikvandijk"},
    20: {"name": "Coline Haslé", "url": "https://unsplash.com/@kohlun2000"},
    21: {"name": "Magdalena Smolnicka", "url": "https://unsplash.com/@magdaleny"},
    22: {"name": "Ebba Thoresson", "url": "https://unsplash.com/@momentsbyebba"},
    23: {"name": "Codioful", "url": "https://unsplash.com/@codioful"},
    24: {"name": "Christian Boragine", "url": "https://unsplash.com/@aimha"},
    25: {"name": "Marshal Quast", "url": "https://unsplash.com/@marshalquast"},
    26: {"name": "Rachel McDermott", "url": "https://unsplash.com/@mrsrachelmcdermott"},
    27: {"name": "Melanie Rosillo Galvan", "url": "https://unsplash.com/@meroga_"},
    28: {"name": "Simon White", "url": "https://unsplash.com/@simfoto"},
    29: {"name": "Annie Spratt", "url": "https://unsplash.com/@anniespratt"},
    30: {"name": "Robert Katzki", "url": "https://unsplash.com/@ro_ka"},
    31: {"name": "atelierbyvineeth", "url": "https://unsplash.com/@atelierbyvineeth"},
    32: {"name": "Maciek Sulkowski", "url": "https://unsplash.com/@macieksulkowski"},
    33: {"name": "Isaac Benhesed", "url": "https://unsplash.com/@isaacbenhesed"},
    34: {"name": "Jackie Alexander", "url": "https://unsplash.com/@jackiealexander"},
    35: {"name": "Nicholas Green", "url": "https://unsplash.com/@nickxshotz"},
    36: {"name": "James Lee", "url": "https://unsplash.com/@jbl12761"},
    37: {"name": "Mads Eneqvist", "url": "https://unsplash.com/@madseneqvist"},
    38: {"name": "Marina Vitale", "url": "https://unsplash.com/@marina_mv08"},
    39: {"name": "Janko Ferlič", "url": "https://unsplash.com/@itfeelslikefilm"},
    40: {"name": "Jon Tyson", "url": "https://unsplash.com/@jontyson"},
    41: {"name": "Zac Ong", "url": "https://unsplash.com/@zacong"},
    42: {"name": "Jackson Hendry", "url": "https://unsplash.com/@actionjackson801"},
    43: {"name": "v2osk", "url": "https://unsplash.com/@v2osk"},
    44: {"name": "Luke Moss", "url": "https://unsplash.com/@lmoss_photo"},
    45: {"name": "Annie Spratt", "url": "https://unsplash.com/@anniespratt"},
    46: {"name": "Sven Pieren", "url": "https://unsplash.com/@sven_pieren"},
    47: {"name": "Samuel Dixon", "url": "https://unsplash.com/@samueldixon"},
    48: {"name": "Tristan B.", "url": "https://unsplash.com/@floudeciel"},
    49: {"name": "Marshal Quast", "url": "https://unsplash.com/@marshalquast"},
    50: {"name": "Sven Pieren", "url": "https://unsplash.com/@sven_pieren"},
}

RAW_DIR = "public/images/raw"
OUTPUT_DIR = "public/images/levels"


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


def draw_label(draw, text, x, y, font, anchor="lt"):
    """绘制带背景的标签"""
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
    draw.rectangle([rx, ry, rx + tw + padding * 2, ry + th + padding * 2], fill=(0, 0, 0, 120))
    draw.text((rx + padding + shadow_offset, ry + padding + shadow_offset), text, fill=(0, 0, 0, 150), font=font)
    draw.text((rx + padding, ry + padding), text, fill=(255, 255, 255, 240), font=font)


def add_author_watermark(input_path, output_path, author_name):
    """为图片添加作者水印"""
    try:
        img = Image.open(input_path).convert("RGB")
        w, h = img.size

        # 转换为RGBA以便添加透明层
        img_rgba = img.convert("RGBA")
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # 字体大小根据图片尺寸调整
        font_size = int(min(w, h) / 30)
        font = get_font(font_size)

        # 右下角添加作者水印
        label_text = f"Photo: {author_name}"
        draw_label(draw, label_text, w, h, font, anchor="rb")

        # 合并图层
        result = Image.alpha_composite(img_rgba, overlay)
        result = result.convert("RGB")
        result.save(output_path, "JPEG", quality=92)

        return True
    except Exception as e:
        print(f"  处理失败: {e}")
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    success_count = 0
    for lid in range(1, 51):
        input_path = os.path.join(RAW_DIR, f"level{lid}.jpg")
        output_path = os.path.join(OUTPUT_DIR, f"level{lid}.jpg")

        # 如果原始图片不存在，尝试从level目录复制
        if not os.path.exists(input_path):
            print(f"关卡 {lid}: 原始图片不存在，跳过")
            continue

        author = AUTHORS.get(lid, {})
        author_name = author.get("name", "")

        print(f"处理关卡 {lid}: 添加作者水印 '{author_name}'")

        if add_author_watermark(input_path, output_path, author_name):
            success_count += 1
            print(f"  ✓ 成功")
        else:
            print(f"  ✗ 失败")

    print(f"\n完成！成功处理 {success_count}/50 张图片")


if __name__ == "__main__":
    main()
