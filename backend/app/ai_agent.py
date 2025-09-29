import os
import pandas as pd
import sqlparse
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

from groq import Groq  # Groq SDK

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set in environment")

client = Groq(api_key=GROQ_API_KEY)


def run_sql_query(db: Session, query: str):
    """Run a raw SQL query safely and return a Pandas DataFrame."""
    try:
        result = db.execute(text(query))
        rows = result.fetchall()
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame(rows, columns=result.keys())
        return df
    except Exception as e:
        return pd.DataFrame({"error": [str(e)]})


def generate_sql_from_question(question: str, table_name: str = "uploaded_data") -> str:
    """Use Groq to turn a natural language question into a SQL query (MySQL)."""
    system_prompt = (
        "You are a data analyst. "
        "Given a MySQL table named `{}` with columns, generate a valid MySQL SELECT query to answer the user's question. "
        "Return only the SQL query, nothing else."
    ).format(table_name)

    user_prompt = f"Question: {question}"

    # Groq chat API usage
    resp = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        model="llama-3.3-70b-versatile"  # example model name, adapt to what you have
    )

    # The response content (string) should be the SQL
    content = resp.choices[0].message.content
    # Clean up content (strip markdown, extract SELECT)
    sql = _extract_sql(content)
    # Format nicely
    sql = sqlparse.format(sql, reindent=True, keyword_case="upper")
    return sql


def _extract_sql(text: str) -> str:
    """Helper to strip markdown and pick the SQL part."""
    import re
    # Remove triple backticks if present
    t = re.sub(r"```sql|```", "", text)
    # find first "SELECT" (case-insensitive)
    idx = t.lower().find("select")
    if idx >= 0:
        return t[idx:].strip()
    return t.strip()


def answer_question(question: str, db: Session):
    """NL → SQL via Groq → query → return result or error."""
    sql_query = generate_sql_from_question(question, table_name="uploaded_data")

    df = run_sql_query(db, sql_query)

    if "error" in df.columns:
        return {"sql": sql_query, "error": df["error"][0]}

    return {
        "sql": sql_query,
        "preview": df.head(10).to_dict(orient="records"),
    }
