from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # ✅ NEW
from tensorflow.keras.models import load_model
from PIL import Image, UnidentifiedImageError
import numpy as np
from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MODEL_PATH = os.getenv("MODEL_PATH")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load AI model
model = load_model(MODEL_PATH)

# Define disease classes and treatments (same as before)
disease_classes = [
    'bean_rust','maize_blight','maize_healthy','maize_gray_leaf_spot','maize_common_rust',
    'bean_healthy','bean_angular_leaf_spot','tomato_bacterial_spot','tomato_early_blight',
    'tomato_late_blight','tomato_leaf_mold','tomato_septoria_leaf_spot',
    'tomato_spider_mites_two-spotted_spider_mite','tomato_target_spot',
    'tomato_tomato_yellow_leaf_curl_virus','tomato_tomato_mosaic_virus','tomato_healthy'
]

treatments = {
    'bean_rust': 'Remove infected leaves, apply neem-based fungicide.',
    'maize_blight': 'Use resistant seeds, crop rotation, apply copper fungicide.',
    'maize_healthy': 'No treatment needed, continue normal care.',
    'maize_gray_leaf_spot': 'Remove infected leaves, apply appropriate fungicide.',
    'maize_common_rust': 'Remove rust spots, avoid overhead watering.',
    'bean_healthy': 'No treatment needed, continue normal care.',
    'bean_angular_leaf_spot': 'Remove infected leaves, use organic fungicides.',
    'tomato_bacterial_spot': 'Use copper-based sprays, remove infected leaves.',
    'tomato_early_blight': 'Apply neem or sulfur fungicides, remove affected leaves.',
    'tomato_late_blight': 'Use resistant varieties, remove infected leaves, apply fungicide.',
    'tomato_leaf_mold': 'Improve air circulation, apply copper fungicide.',
    'tomato_septoria_leaf_spot': 'Remove infected leaves, apply organic fungicide.',
    'tomato_spider_mites_two-spotted_spider_mite': 'Spray neem oil or insecticidal soap.',
    'tomato_target_spot': 'Remove affected leaves, apply copper fungicide.',
    'tomato_tomato_yellow_leaf_curl_virus': 'Use resistant varieties, control whiteflies.',
    'tomato_tomato_mosaic_virus': 'Remove infected plants, sanitize tools.',
    'tomato_healthy': 'No treatment needed, continue normal care.'
}

# Initialize FastAPI
app = FastAPI(title="Crop Disease Detection API")

# ✅ Enable CORS for your frontend(s)
origins = [
    "https://reimagined-palm-tree-pj7p7jwg4jjwhrvpr-3000.app.github.dev",       # Local frontend
    "https://ai-disease-detector.vercel.app"  # Deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Allowed image types
ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]

@app.post("/predict/")
async def predict_crop(file: UploadFile = File(...)):

    # 1️⃣ Validate file type
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Only jpg, jpeg, png allowed.")

    try:
        # 2️⃣ Read and preprocess image
        img = Image.open(file.file).convert("RGB").resize((128, 128))
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Cannot read image file.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

    try:
        # 3️⃣ Run AI prediction
        prediction = model.predict(img_array)
        predicted_index = int(np.argmax(prediction))
        predicted_disease = disease_classes[predicted_index]
        severity = float(np.max(prediction))
        treatment = treatments[predicted_disease]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting disease: {str(e)}")

    try:
        # 4️⃣ Upload image to Supabase Storage
        file.file.seek(0)
        file_bytes = file.file.read()
        storage_path = f"{file.filename}"
        supabase.storage.from_("crop-images").upload(storage_path, file_bytes, {"upsert": "true"})
        image_url = supabase.storage.from_("crop-images").get_public_url(storage_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

    try:
        # 5️⃣ Insert prediction into Supabase Database
        supabase.table("backend").insert({
            "image_url": image_url,
            "crop_name": file.filename.split('_')[0],
            "disease_name": predicted_disease,
            "severity": severity,
            "treatment": treatment
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving to database: {str(e)}")

    # 6️⃣ Return JSON response
    return {
        "image_url": image_url,
        "disease": predicted_disease,
        "severity": severity,
        "treatment": treatment
    }
