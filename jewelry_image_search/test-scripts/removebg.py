from rembg import remove
from PIL import Image, ImageFilter, ImageEnhance
import io
import numpy as np

def create_crisp_catalog_image(input_path, output_path):
    # Remove background
    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    output_data = remove(input_data)
    img_no_bg = Image.open(io.BytesIO(output_data)).convert("RGBA")
    
    # Enhance the object before compositing
    # 1. Sharpen the image for crispness
    img_no_bg = img_no_bg.filter(ImageFilter.UnsharpMask(radius=1.5, percent=150, threshold=3))
    
    # 2. Enhance contrast and color
    enhancer = ImageEnhance.Contrast(img_no_bg)
    img_no_bg = enhancer.enhance(1.1)  # Slight contrast boost
    
    enhancer = ImageEnhance.Color(img_no_bg)
    img_no_bg = enhancer.enhance(1.05)  # Slight color boost
    
    # 3. Clean up edges with slight blur on alpha channel
    alpha = img_no_bg.split()[-1]  # Get alpha channel
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.5))  # Smooth edges slightly
    
    # Recombine with cleaned alpha
    img_no_bg = Image.merge('RGBA', img_no_bg.split()[:3] + (alpha,))
    
    # Create white background with slight padding for catalog look
    padding = 50  # Add padding around object
    new_size = (img_no_bg.width + padding*2, img_no_bg.height + padding*2)
    white_bg = Image.new("RGBA", new_size, (255, 255, 255, 255))
    
    # Center the object on white background
    offset = ((new_size[0] - img_no_bg.width) // 2, 
             (new_size[1] - img_no_bg.height) // 2)
    white_bg.paste(img_no_bg, offset, img_no_bg)
    
    # Convert to RGB and apply final sharpening
    final_image = white_bg.convert("RGB")
    final_image = final_image.filter(ImageFilter.UnsharpMask(radius=0.5, percent=100, threshold=2))
    
    # Save with high quality
    final_image.save(output_path, 'JPEG', quality=98, optimize=True, dpi=(300, 300))
    
    return final_image

# Usage
create_crisp_catalog_image(r'E:\bonrix-software-systems-projects\jewelry_image_search\zipfiles\Demo_img-sample\2~1.jpg', 'crisp_catalog_output.jpg')