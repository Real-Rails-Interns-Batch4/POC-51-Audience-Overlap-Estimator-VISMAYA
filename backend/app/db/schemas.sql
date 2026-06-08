-- Professional Profiles (LinkedIn proxy)
CREATE TABLE IF NOT EXISTS linkedin_profiles (
    profile_id INTEGER PRIMARY KEY,
    job_title VARCHAR,
    industry VARCHAR,
    region VARCHAR,
    company_size VARCHAR,
    device_type VARCHAR,
    audience_hash VARCHAR
);

-- Media Consumers (GDELT proxy)
CREATE TABLE IF NOT EXISTS gdelt_consumers (
    consumer_id INTEGER PRIMARY KEY,
    interest_category VARCHAR,
    media_source VARCHAR,
    region VARCHAR,
    frequency_level VARCHAR,
    device_type VARCHAR,
    audience_hash VARCHAR
);

-- Precomputed coefficients for reach estimation
CREATE TABLE IF NOT EXISTS reach_model_parameters (
    channel VARCHAR PRIMARY KEY,
    alpha DOUBLE, -- Saturation upper limit (max reach fraction)
    beta DOUBLE   -- Saturation curve slope coefficient (speed of growth)
);
