import os
from supabase import create_client
from dotenv import load_dotenv

# Load .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

file_path = "test_crop.JPG"
storage_path = "test_crop.JPG"

# 1. Upload file
with open(file_path, "rb") as f:
    supabase.storage.from_("crop-images").upload(storage_path, f, {"upsert": "true"})

# 2. Get public URL
public_url = supabase.storage.from_("crop-images").get_public_url(storage_path)
print("Public URL:", public_url)

# Example prediction results (normally from your AI model)
crop_name = "maize"
disease_name = "maize_blight"
severity = 0.87   # 87% confidence
treatment = "Use organic fungicide and remove infected leaves."

# 3. Insert into database
res = supabase.table("backend").insert({
    "image_url": public_url,
    "crop_name": crop_name,
    "disease_name": disease_name,
    "severity": severity,
    "treatment": treatment
}).execute()

print("Database insert result:", res)

