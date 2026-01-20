
from PIL import Image
import os

source_path = r"C:/Users/mferreio/.gemini/antigravity/brain/cae590ad-09be-4c75-a087-f11da2c73b9f/uploaded_image_1768597184911.png"
dest_dir = r"c:\Matheus\extensao_bdd_v1.3\icons"
sizes = [16, 32, 48, 128]

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

try:
    with Image.open(source_path) as img:
        for size in sizes:
            resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
            output_path = os.path.join(dest_dir, f"icon{size}.png")
            resized_img.save(output_path, "PNG")
            print(f"Generated {output_path}")
    print("All icons generated successfully.")
except Exception as e:
    print(f"Error generating icons: {e}")
