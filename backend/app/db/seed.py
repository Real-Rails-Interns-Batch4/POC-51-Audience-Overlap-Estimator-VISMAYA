import os
import random
import hashlib
import pandas as pd
from app.core.database import get_db

# Configuration
UNIVERSE_SIZE = 50000  # Total unique audience members
LINKEDIN_PROBABILITY = 0.55  # Probability a user is on LinkedIn
GDELT_PROBABILITY = 0.70  # Probability a user reads GDELT tracked media

# Seed lists
REGIONS = ["US", "EU", "APAC", "LATAM"]
REGIONS_PROBS = [0.45, 0.30, 0.15, 0.10]  # Skewed regions

INDUSTRIES = ["Tech", "Finance", "Healthcare", "Education", "Marketing"]
JOB_TITLES_BY_INDUSTRY = {
    "Tech": ["Software Engineer", "Product Manager", "Data Scientist", "CTO", "DevOps Engineer"],
    "Finance": ["Financial Analyst", "Investment Banker", "Portfolio Manager", "CFO", "Accountant"],
    "Healthcare": ["Medical Doctor", "Nurse", "Healthcare Administrator", "Pharmacist", "Clinical Researcher"],
    "Education": ["Professor", "Teacher", "Academic Advisor", "School Principal", "Librarian"],
    "Marketing": ["Marketing Manager", "SEO Specialist", "Content Strategist", "Brand Director", "PR Specialist"]
}
COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]

CATEGORIES = ["Technology", "Politics", "Business", "Science", "Entertainment"]
MEDIA_BY_CATEGORY = {
    "Technology": ["TechCrunch", "Wired", "The Verge", "Ars Technica", "ZDNet"],
    "Politics": ["CNN", "BBC", "Reuters", "The Guardian", "The New York Times"],
    "Business": ["Bloomberg", "Wall Street Journal", "Financial Times", "Forbes", "CNBC"],
    "Science": ["Nature", "Scientific American", "New Scientist", "National Geographic", "NASA News"],
    "Entertainment": ["Netflix News", "Hollywood Reporter", "Variety", "Billboard", "Rolling Stone"]
}
FREQUENCY_LEVELS = ["High", "Medium", "Low"]
DEVICES = ["Desktop", "Mobile", "Tablet"]

# Industry to category affinity to make overlap feel intelligent and correlation-based
INDUSTRY_AFFINITY = {
    "Tech": "Technology",
    "Finance": "Business",
    "Healthcare": "Science",
    "Education": "Politics",
    "Marketing": "Entertainment"
}

def generate_seed_data():
    random.seed(42)  # For deterministic seeding
    
    linkedin_records = []
    gdelt_records = []
    
    linkedin_id_counter = 1
    gdelt_id_counter = 1
    
    print(f"Generating synthetic universe of {UNIVERSE_SIZE} items...")
    
    for i in range(UNIVERSE_SIZE):
        # 1. Create a unique user identifier and hash
        user_id = f"usr_{i:05d}"
        audience_hash = hashlib.md5(user_id.encode()).hexdigest()
        
        # 2. Assign geographical region stochastically (consistent across channels)
        region = random.choices(REGIONS, weights=REGIONS_PROBS, k=1)[0]
        device = random.choice(DEVICES)
        
        # 3. Stochastic check for LinkedIn membership
        has_linkedin = random.random() < LINKEDIN_PROBABILITY
        # 4. Stochastic check for GDELT reader panel
        has_gdelt = random.random() < GDELT_PROBABILITY
        
        industry = None
        if has_linkedin:
            industry = random.choice(INDUSTRIES)
            job_title = random.choice(JOB_TITLES_BY_INDUSTRY[industry])
            company_size = random.choice(COMPANY_SIZES)
            
            linkedin_records.append({
                "profile_id": linkedin_id_counter,
                "job_title": job_title,
                "industry": industry,
                "region": region,
                "company_size": company_size,
                "device_type": device,
                "audience_hash": audience_hash
            })
            linkedin_id_counter += 1
            
        if has_gdelt:
            # High affinity mapping: 75% chance they read about their professional interest
            if industry and random.random() < 0.75:
                category = INDUSTRY_AFFINITY[industry]
            else:
                category = random.choice(CATEGORIES)
                
            media_source = random.choice(MEDIA_BY_CATEGORY[category])
            freq = random.choice(FREQUENCY_LEVELS)
            
            gdelt_records.append({
                "consumer_id": gdelt_id_counter,
                "interest_category": category,
                "media_source": media_source,
                "region": region,
                "frequency_level": freq,
                "device_type": device,
                "audience_hash": audience_hash
            })
            gdelt_id_counter += 1
            
    # Convert lists to Pandas DataFrames
    df_linkedin = pd.DataFrame(linkedin_records)
    df_gdelt = pd.DataFrame(gdelt_records)
    
    # Reach curves saturation coefficients
    df_reach_params = pd.DataFrame([
        {"channel": "linkedin", "alpha": 0.82, "beta": 0.00012},  # Saturation limit: 82%, growth: 0.00012 per $
        {"channel": "gdelt", "alpha": 0.88, "beta": 0.00008}      # Saturation limit: 88%, growth: 0.00008 per $
    ])
    
    print(f"Generated {len(df_linkedin)} LinkedIn profiles.")
    print(f"Generated {len(df_gdelt)} GDELT media consumption profiles.")
    
    return df_linkedin, df_gdelt, df_reach_params

def seed_db():
    # Read schemas SQL
    schema_path = os.path.join(os.path.dirname(__file__), "schemas.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()
        
    df_linkedin, df_gdelt, df_reach_params = generate_seed_data()
    
    with get_db() as conn:
        print("Executing schemas.sql...")
        # Split sql file into separate commands
        for command in schema_sql.split(";"):
            cmd = command.strip()
            if cmd:
                conn.execute(cmd)
                
        # Drop existing records to avoid duplicates
        conn.execute("DELETE FROM linkedin_profiles")
        conn.execute("DELETE FROM gdelt_consumers")
        conn.execute("DELETE FROM reach_model_parameters")
        
        # Insert using Pandas registrations (very clean)
        print("Inserting records into database...")
        conn.register("df_linkedin", df_linkedin)
        conn.execute("INSERT INTO linkedin_profiles SELECT * FROM df_linkedin")
        
        conn.register("df_gdelt", df_gdelt)
        conn.execute("INSERT INTO gdelt_consumers SELECT * FROM df_gdelt")
        
        conn.register("df_reach_params", df_reach_params)
        conn.execute("INSERT INTO reach_model_parameters SELECT * FROM df_reach_params")
        
        # Verify insertion count
        li_count = conn.execute("SELECT count(*) FROM linkedin_profiles").fetchone()[0]
        gd_count = conn.execute("SELECT count(*) FROM gdelt_consumers").fetchone()[0]
        param_count = conn.execute("SELECT count(*) FROM reach_model_parameters").fetchone()[0]
        
        print(f"Db Seeding Finished. Counts:")
        print(f" - linkedin_profiles: {li_count}")
        print(f" - gdelt_consumers: {gd_count}")
        print(f" - reach_model_parameters: {param_count}")

if __name__ == "__main__":
    seed_db()
