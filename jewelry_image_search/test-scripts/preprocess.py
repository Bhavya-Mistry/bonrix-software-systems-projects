# # retriever/preprocess.py
# from PIL import Image
# import rembg
# import io

# def remove_bg(input_image: Image.Image) -> Image.Image:
#     """Remove the background from the image using rembg."""
#     # Convert Image to byte format for rembg processing
#     img_byte_arr = io.BytesIO()
#     input_image.save(img_byte_arr, format='PNG')
#     img_byte_arr = img_byte_arr.getvalue()

#     # Perform background removal using rembg
#     output_image = rembg.remove(img_byte_arr)

#     # Convert back to PIL Image
#     return Image.open(io.BytesIO(output_image))

# def crop_image(input_image: Image.Image, crop_area=None) -> Image.Image:
#     """Crop the image. If crop_area is not defined, return the whole image."""
#     if crop_area:
#         return input_image.crop(crop_area)
#     return input_image

# def load_rgb(path_or_pil):
#     """Load image, remove background, and crop."""
#     if isinstance(path_or_pil, Image.Image):
#         img = path_or_pil
#     else:
#         img = Image.open(path_or_pil)

#     # Remove background
#     img = remove_bg(img)

#     # Optionally crop: you can define the crop area (left, upper, right, lower)
#     # Example crop_area = (100, 100, 500, 500) — customize as per your needs.
#     crop_area = None  # Change this if you want specific crop dimensions
#     img = crop_image(img, crop_area)

#     return img.convert("RGB")  # Ensure image is in RGB mode
