import pandas as pd
import numpy as np


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean raw Excel data before inserting into MySQL.
    Steps:
      - Replace unnamed columns
      - Drop empty rows/columns
      - Fill missing values
      - Standardize column names
    """

    # Replace unnamed columns
    df.columns = [
        f"col_{i}" if "unnamed" in str(c).lower() else str(c).strip().replace(" ", "_").lower()
        for i, c in enumerate(df.columns)
    ]

    # Drop completely empty rows & columns
    df.dropna(axis=0, how="all", inplace=True)
    df.dropna(axis=1, how="all", inplace=True)

    # Fill missing numeric values with median
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col].fillna(df[col].median(), inplace=True)

    # Fill missing categorical values with "Unknown"
    for col in df.select_dtypes(include=[object]).columns:
        df[col].fillna("Unknown", inplace=True)

    # Ensure all column names are safe for SQL
    df.columns = [c.replace("-", "_").replace(".", "_") for c in df.columns]

    return df


def dataframe_to_mysql(df: pd.DataFrame, table_name: str, engine):
    """
    Write a DataFrame to MySQL, replacing the table if it exists.
    """
    try:
        df.to_sql(table_name, con=engine, if_exists="replace", index=False)
        return True
    except Exception as e:
        print("Error writing to MySQL:", e)
        return False
