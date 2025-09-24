from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from supabase import create_client
from dotenv import load_dotenv
import os

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MODEL_PATH = os.getenv("MODEL_PATH")

# -----------------------------
# Initialize Supabase and Model
# -----------------------------
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
model = load_model(MODEL_PATH)

# -----------------------------
# Disease classes
# -----------------------------
disease_classes = [
    'bean_rust','maize_blight','maize_healthy','maize_gray_leaf_spot','maize_common_rust',
    'bean_healthy','bean_angular_leaf_spot','tomato_bacterial_spot','tomato_early_blight',
    'tomato_late_blight','tomato_leaf_mold','tomato_septoria_leaf_spot',
    'tomato_spider_mites_two-spotted_spider_mite','tomato_target_spot',
    'tomato_tomato_yellow_leaf_curl_virus','tomato_tomato_mosaic_virus','tomato_healthy'
]

# -----------------------------
# Initialize FastAPI
# -----------------------------
app = FastAPI(title="Crop Disease Detection API")

origins = [
    "https://localhost:3000",
    "https://ai-disease-detector.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]

# -----------------------------
# Helper: Fetch treatment by disease + locale
# -----------------------------
def get_treatment(disease_name: str, locale: str = "en") -> str:
    try:
        response = supabase.table("disease_translations") \
            .select("treatment") \
            .eq("disease_name", disease_name) \
            .eq("locale", locale) \
            .execute()
        if response.data:
            return response.data[0]["treatment"]
        # fallback to English
        fallback = supabase.table("disease_translations") \
            .select("treatment") \
            .eq("disease_name", disease_name) \
            .eq("locale", "en") \
            .execute()
        return fallback.data[0]["treatment"] if fallback.data else "No treatment available"
    except Exception:
        return "No treatment available"

# -----------------------------
# POST /predict/ - Make a prediction
# -----------------------------
@app.post("/predict/")
async def predict_crop(file: UploadFile = File(...), locale: str = Query("en")):
    # Validate file type
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Only jpg, jpeg, png allowed.")

    # Preprocess image
    try:
        img = Image.open(file.file).convert("RGB").resize((128, 128))
        img_array = np.expand_dims(np.array(img, dtype=np.float32)/255.0, axis=0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

    # AI prediction
    try:
        prediction = model.predict(img_array)
        predicted_index = int(np.argmax(prediction))
        predicted_disease = disease_classes[predicted_index]
        severity = float(np.max(prediction))
        treatment = get_treatment(predicted_disease, locale)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting disease: {str(e)}")

    # Upload image to Supabase Storage
    try:
        file.file.seek(0)
        file_bytes = file.file.read()
        storage_path = f"{file.filename}"
        supabase.storage.from_("crop-images").upload(storage_path, file_bytes, {"upsert": "true"})
        image_url = supabase.storage.from_("crop-images").get_public_url(storage_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

    # Save prediction WITHOUT treatment or locale
    try:
        supabase.table("backend").insert({
            "image_url": image_url,
            "crop_name": file.filename.split('_')[0],
            "disease_name": predicted_disease,
            "severity": severity
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving to database: {str(e)}")

    return {
        "image_url": image_url,
        "disease": predicted_disease,
        "severity": severity,
        "treatment": treatment
    }

# -----------------------------
# GET /predictions/ - Fetch all predictions dynamically localized
# -----------------------------
@app.get("/predictions/")
def get_predictions(locale: str = Query("en")):
    try:
        predictions = supabase.table("backend").select("*").order("created_at", desc=True).execute()
        localized_predictions = []

        for record in predictions.data:
            record["treatment"] = get_treatment(record["disease_name"], locale)
            localized_predictions.append(record)

        return localized_predictions

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching predictions: {str(e)}")

