from PIL import Image, ImageDraw, ImageFont
import os

def add_rule_of_thirds_overlay(input_path, output_path, title="三分法构图"):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    line_color = (255, 255, 255, 200)
    line_width = max(2, int(min(width, height) / 500))
    
    third_w = width / 3
    third_h = height / 3
    
    dash_length = max(10, int(min(width, height) / 80))
    gap_length = max(8, int(min(width, height) / 100))
    
    def draw_dashed_line(x1, y1, x2, y2):
        dx = x2 - x1
        dy = y2 - y1
        length = (dx**2 + dy**2) ** 0.5
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
            
            draw.line([(sx, sy), (ex, ey)], fill=line_color, width=line_width)
    
    draw_dashed_line(third_w, 0, third_w, height)
    draw_dashed_line(2 * third_w, 0, 2 * third_w, height)
    draw_dashed_line(0, third_h, width, third_h)
    draw_dashed_line(0, 2 * third_h, width, 2 * third_h)
    
    dot_radius = max(4, int(min(width, height) / 150))
    dot_color = (255, 255, 255, 230)
    
    intersections = [
        (third_w, third_h),
        (2 * third_w, third_h),
        (third_w, 2 * third_h),
        (2 * third_w, 2 * third_h),
    ]
    
    for x, y in intersections:
        draw.ellipse(
            [x - dot_radius, y - dot_radius, x + dot_radius, y + dot_radius],
            fill=dot_color
        )
    
    font_size = int(min(width, height) / 18)
    font_paths = [
        "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    font = None
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except:
                continue
    if font is None:
        font = ImageFont.load_default()
    
    padding = int(font_size * 0.8)
    text_bbox = draw.textbbox((0, 0), title, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    text_x = padding
    text_y = padding
    
    bg_padding = int(font_size * 0.3)
    draw.rectangle(
        [
            text_x - bg_padding,
            text_y - bg_padding,
            text_x + text_width + bg_padding,
            text_y + text_height + bg_padding,
        ],
        fill=(0, 0, 0, 100)
    )
    
    shadow_offset = max(2, int(font_size / 20))
    draw.text(
        (text_x + shadow_offset, text_y + shadow_offset),
        title,
        fill=(0, 0, 0, 150),
        font=font
    )
    draw.text(
        (text_x, text_y),
        title,
        fill=(255, 255, 255, 230),
        font=font
    )
    
    result = Image.alpha_composite(img, overlay)
    result = result.convert("RGB")
    result.save(output_path, "JPEG", quality=90)
    print(f"已保存: {output_path}")
    print(f"尺寸: {width}x{height}")

if __name__ == "__main__":
    input_file = "public/images/level1-rule-of-thirds.jpg"
    output_file = "public/images/level1-rule-of-thirds-overlay.jpg"
    add_rule_of_thirds_overlay(input_file, output_file, "三分法构图")
