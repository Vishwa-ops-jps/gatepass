import os
from PIL import Image, ImageDraw, ImageFont

def make_gradient(width, height, color1, color2):
    """Linear diagonal gradient from color1 to color2."""
    base = Image.new('RGB', (width, height), color1)
    top = Image.new('RGB', (width, height), color2)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        for x in range(width):
            dist = (x / width + y / height) / 2.0
            val = int(dist * 255)
            mask_data.append(min(255, max(0, val)))
    mask.putdata(mask_data)
    return Image.composite(top, base, mask)

def draw_shield(draw, cx, cy, w, h, fill_color, outline_color=None, outline_width=0):
    """Draw a smooth curved shield."""
    w2 = w / 2.0
    top_y = cy - h * 0.42
    mid_y = cy + h * 0.12
    bot_y = cy + h * 0.48
    
    # Polygon approximation with curved bottom
    pts = [
        (cx - w2, top_y),
        (cx - w2 * 0.5, top_y - h * 0.05),
        (cx, top_y - h * 0.07),
        (cx + w2 * 0.5, top_y - h * 0.05),
        (cx + w2, top_y),
        (cx + w2, mid_y),
        (cx + w2 * 0.85, mid_y + h * 0.18),
        (cx + w2 * 0.5, bot_y - h * 0.08),
        (cx, bot_y),
        (cx - w2 * 0.5, bot_y - h * 0.08),
        (cx - w2 * 0.85, mid_y + h * 0.18),
        (cx - w2, mid_y),
    ]
    draw.polygon(pts, fill=fill_color, outline=outline_color, width=outline_width)

def draw_checkmark(draw, cx, cy, size, color, width=16):
    """Draw a bold checkmark centered at (cx, cy)."""
    p1 = (cx - size * 0.42, cy - size * 0.02)
    p2 = (cx - size * 0.10, cy + size * 0.32)
    p3 = (cx + size * 0.44, cy - size * 0.34)
    draw.line([p1, p2, p3], fill=color, width=width, joint="curve")

def generate_all_icons():
    # Supersampling factor for smooth edges
    S = 2
    
    # Colors: Emerald, Teal, Pure White, Gold Accent
    C_BG_TOP = (16, 185, 129)       # Vibrant Emerald #10B981
    C_BG_BOT = (6, 78, 59)          # Deep Emerald #064E3B
    C_TEAL = (13, 148, 136)         # Teal #0D9488
    C_WHITE = (255, 255, 255)
    C_SHIELD_OUTLINE = (255, 255, 255, 240)
    C_GOLD = (245, 158, 11)         # Gold #F59E0B
    C_EMERALD_LIGHT = (52, 211, 153) # #34D399

    # 1. Main App Icon (512x512)
    W, H = 512 * S, 512 * S
    icon_img = make_gradient(W, H, (16, 185, 129), (5, 46, 36)).convert('RGBA')
    draw = ImageDraw.Draw(icon_img)
    
    # Concentric ambient glow ring
    draw.ellipse([W*0.12, H*0.12, W*0.88, H*0.88], outline=(255, 255, 255, 35), width=int(12 * S))
    draw.ellipse([W*0.18, H*0.18, W*0.82, H*0.82], outline=(52, 211, 153, 50), width=int(6 * S))
    
    # Outer Shield (White Border)
    draw_shield(draw, W/2, H/2, W*0.62, H*0.66, fill_color=(255, 255, 255, 30), outline_color=(255, 255, 255, 230), outline_width=int(14 * S))
    # Inner Shield (Rich Emerald fill)
    draw_shield(draw, W/2, H/2, W*0.54, H*0.58, fill_color=(6, 78, 59, 240), outline_color=(52, 211, 153, 200), outline_width=int(4 * S))
    
    # Checkmark inside shield
    draw_checkmark(draw, W/2, H/2, W*0.34, (255, 255, 255, 255), width=int(22 * S))
    # Little gold accent star on top
    draw.ellipse([W/2 - 12*S, H*0.25 - 12*S, W/2 + 12*S, H*0.25 + 12*S], fill=C_GOLD)
    
    icon_final = icon_img.resize((512, 512), Image.Resampling.LANCZOS)
    
    # 2. Android Adaptive Icon Foreground (432x432, 100% Transparent Background)
    # Note: Android adaptive icons safe zone is inner 66% (288x288)
    W_F, H_F = 432 * S, 432 * S
    fore_img = Image.new('RGBA', (W_F, H_F), (0, 0, 0, 0))
    draw_f = ImageDraw.Draw(fore_img)
    
    # Centered Shield (scaled to fit well inside 288px safe zone)
    draw_shield(draw_f, W_F/2, H_F/2, W_F*0.48, H_F*0.52, fill_color=(16, 185, 129, 250), outline_color=(255, 255, 255, 255), outline_width=int(12 * S))
    draw_shield(draw_f, W_F/2, H_F/2, W_F*0.42, H_F*0.46, fill_color=(6, 78, 59, 230), outline_color=(245, 158, 11, 220), outline_width=int(4 * S))
    draw_checkmark(draw_f, W_F/2, H_F/2, W_F*0.26, (255, 255, 255, 255), width=int(16 * S))
    
    fore_final = fore_img.resize((432, 432), Image.Resampling.LANCZOS)
    
    # 3. Android Adaptive Icon Background (432x432)
    bg_img = make_gradient(W_F, H_F, (15, 30, 60), (6, 78, 59)).convert('RGBA')
    bg_final = bg_img.resize((432, 432), Image.Resampling.LANCZOS)
    
    # 4. Monochrome Adaptive Icon (White silhouette on transparent)
    mono_img = Image.new('RGBA', (W_F, H_F), (0, 0, 0, 0))
    draw_m = ImageDraw.Draw(mono_img)
    draw_shield(draw_m, W_F/2, H_F/2, W_F*0.48, H_F*0.52, fill_color=(255, 255, 255, 255), outline_color=None)
    draw_checkmark(draw_m, W_F/2, H_F/2, W_F*0.26, (0, 0, 0, 255), width=int(16 * S))
    mono_final = mono_img.resize((432, 432), Image.Resampling.LANCZOS)

    # 5. Logo with Pure Transparent Background & Crisp Typography (800x220)
    W_L, H_L = 800 * S, 220 * S
    logo_img = Image.new('RGBA', (W_L, H_L), (0, 0, 0, 0))
    draw_l = ImageDraw.Draw(logo_img)
    
    # Left Shield Emblem
    shield_cx = 120 * S
    shield_cy = H_L / 2
    draw_shield(draw_l, shield_cx, shield_cy, 140 * S, 150 * S, fill_color=(16, 185, 129, 255), outline_color=(255, 255, 255, 240), outline_width=int(8 * S))
    draw_shield(draw_l, shield_cx, shield_cy, 120 * S, 130 * S, fill_color=(6, 78, 59, 240), outline_color=(245, 158, 11, 200), outline_width=int(3 * S))
    draw_checkmark(draw_l, shield_cx, shield_cy, 80 * S, (255, 255, 255, 255), width=int(12 * S))
    
    # Right Text: "GatePass" + "SECURITY & VISITOR DESK"
    try:
        font_main = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(78 * S))
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(20 * S))
    except Exception:
        font_main = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", int(78 * S))
        font_sub = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", int(20 * S))
        
    text_x = 230 * S
    draw_l.text((text_x, 48 * S), "Gate", font=font_main, fill=(255, 255, 255, 255))
    # "Pass" in vibrant emerald
    gate_len = draw_l.textlength("Gate", font=font_main)
    draw_l.text((text_x + gate_len, 48 * S), "Pass", font=font_main, fill=(52, 211, 153, 255))
    
    # TM Symbol
    draw_l.text((text_x + gate_len + draw_l.textlength("Pass", font=font_main) + 4*S, 48 * S), "™", font=font_sub, fill=(245, 158, 11, 255))
    
    # Subtitle
    draw_l.text((text_x, 142 * S), "DIGITAL SECURITY REGISTER & VISITOR DESK", font=font_sub, fill=(148, 163, 184, 255))
    
    logo_final = logo_img.resize((800, 220), Image.Resampling.LANCZOS)
    
    # 6. Favicon (64x64)
    fav_final = icon_final.resize((64, 64), Image.Resampling.LANCZOS)
    
    # Save destinations
    dest_dirs = [
        'assets',
        'apk/assets',
        'server/public/assets',
        'GatePass_APK_Installer/assets'
    ]
    
    for d in dest_dirs:
        os.makedirs(d, exist_ok=True)
        icon_final.save(os.path.join(d, 'icon.png'), 'PNG')
        logo_final.save(os.path.join(d, 'logo.png'), 'PNG')
        logo_final.save(os.path.join(d, 'gatepass_header_logo.png'), 'PNG')
        fore_final.save(os.path.join(d, 'android-icon-foreground.png'), 'PNG')
        fore_final.save(os.path.join(d, 'adaptive-icon.png'), 'PNG')
        bg_final.save(os.path.join(d, 'android-icon-background.png'), 'PNG')
        mono_final.save(os.path.join(d, 'android-icon-monochrome.png'), 'PNG')
        fav_final.save(os.path.join(d, 'favicon.png'), 'PNG')
        print(f"Saved branded assets to {d}/")

if __name__ == '__main__':
    generate_all_icons()
