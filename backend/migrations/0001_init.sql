CREATE TABLE IF NOT EXISTS uploads (
  upload_id TEXT PRIMARY KEY,
  filename TEXT,
  sheets JSONB,
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS query_logs (
  id SERIAL PRIMARY KEY,
  upload_id TEXT REFERENCES uploads(upload_id),
  user_query TEXT,
  generated_sql TEXT,
  result_sample JSONB,
  created_at TIMESTAMP DEFAULT now()
);
