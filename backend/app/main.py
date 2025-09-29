import os
import io
import uuid
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.db import Base, engine, get_db
from app import ai_agent, utils

# Load env variables
load_dotenv()

# Create DB tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow frontend (Vite default: 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Accept Excel file upload, return unique upload_id and available sheet names.
    """
    try:
        contents = await file.read()
        # Parse Excel file safely
        df = pd.ExcelFile(io.BytesIO(contents), engine="openpyxl")
        sheets = df.sheet_names
        upload_id = str(uuid.uuid4())
        return {"upload_id": upload_id, "sheets": sheets}
    except Exception as e:
        return {"error": str(e)}


@app.post("/query/")
async def query_data(
    question: str = Form(...), 
    db: Session = Depends(get_db)
):
    """
    Pass natural language question to AI agent and return answer.
    """
    try:
        result = ai_agent.answer_question(question, db)
        return {"answer": result}
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
def root():
    return {"message": "Excel NLP Analytics API (MySQL version) is running"}
