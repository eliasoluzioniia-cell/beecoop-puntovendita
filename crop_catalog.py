from PIL import Image
import os
import sys

input_dir = r"C:\Users\fabio\Documents\progetti wordpress antigravity\sito web effetti 3 d\assets\img"
output_dir = r"C:\Users\fabio\Documents\progetti wordpress antigravity\sito web effetti 3 d\beecoop-landing\assets"

files = [
    ("prodotti bee coop campagna.jpg", ["arance-sanguinella.jpg", "arance-vaniglia.jpg", "mandarini.jpg", "limoni.jpg", "cedri.jpg", "olio.jpg", "latta-regalo-1.jpg"]),
    ("accessori.jpg", ["grembiule.jpg", "foulard.jpg", "portachiavi.jpg", "latta-regalo.jpg", "portacellulare.jpg", "portacellulare-bottone.jpg", "collana.jpg"]),
    ("coffe.jpg", ["mini-coffe.jpg", "coffa-silver.jpg", "coffa-yellow.jpg", "coffa-blu.jpg", "coffa-elegant.jpg", "coffa-silvie.jpg"])
]

def is_whitespace(pixel):
    # Depending on mode, pixel might be an int or a tuple
    if isinstance(pixel, int):
        return pixel > 240
    # RGB or RGBA tuple
    return pixel[0] > 240 and pixel[1] > 240 and pixel[2] > 240

for filename, target_names in files:
    filepath = os.path.join(input_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    img = Image.open(filepath)
    img = img.convert("RGB")
    width, height = img.size
    
    # We will scan down a vertical line corresponding to the center of the left icons
    # The icons are typically on the left side, starting after some padding
    # Let's say between x=20 and x=110. Let's scan down x=50.
    scan_x = int(width * 0.1) # roughly x=50
    
    in_image = False
    start_y = 0
    
    crops = []
    
    # We also want to find the exact boundaries. 
    # For now, let's just find the Y span.
    for y in range(height):
        pixel = img.getpixel((scan_x, y))
        bg = is_whitespace(pixel)
        
        if not in_image and not bg:
            # We hit an image
            in_image = True
            start_y = y
        elif in_image and bg:
            # We exited an image
            end_y = y
            img_height = end_y - start_y
            # WhatsApp icons are roughly square, so if height is > 40px
            if img_height > 40:
                # We assume the image is a square, so width should be roughly height
                # Left edge is usually around 10-20px
                # Let's find exactly where it starts horizontally at y_mid
                y_mid = start_y + img_height // 2
                start_x = 0
                for x in range(width):
                    if not is_whitespace(img.getpixel((x, y_mid))):
                        start_x = x
                        break
                
                # Crop it as a square
                crop_box = (start_x, start_y, start_x + img_height, end_y)
                crops.append(crop_box)
            in_image = False

    print(f"File: {filename} - Found {len(crops)} images.")
    
    idx = 0
    for i, box in enumerate(crops):
        if idx >= len(target_names):
            break
            
        out_name = target_names[idx]
        if out_name == "latta-regalo-1.jpg":
            idx += 1
            if idx >= len(target_names):
                break
            out_name = target_names[idx]
            
        out_path = os.path.join(output_dir, out_name)
        cropped_img = img.crop(box)
        cropped_img.save(out_path)
        print(f"Saved {out_path}")
        idx += 1
