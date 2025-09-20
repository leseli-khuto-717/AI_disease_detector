from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Step 1: Add locale column if not exists (Supabase Table Editor alternative)
# You can skip this if you already added it manually
try:
    supabase.rpc("add_locale_column_if_not_exists").execute()
except Exception:
    print("Please ensure 'locale' column exists in 'backend' table.")

# Step 2: Fetch all existing predictions
existing_predictions = supabase.table("backend").select("*").execute()

for record in existing_predictions.data:
    disease = record["disease_name"]
    
    # Step 3: Get English treatment from disease_translations table
    response = supabase.table("disease_translations") \
        .select("treatment") \
        .eq("disease_name", disease) \
        .eq("locale", "en") \
        .execute()
    
    if response.data:
        treatment = response.data[0]["treatment"]
        # Step 4: Update backend table
        supabase.table("backend").update({
            "treatment": treatment,
            "locale": "en"
        }).eq("id", record["id"]).execute()
        print(f"Updated record id={record['id']} with English treatment.")
    else:
        print(f"No English treatment found for {disease}, skipping...")
