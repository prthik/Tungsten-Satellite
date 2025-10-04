import sqlite3
from dataclasses import dataclass, asdict, is_dataclass
from data import UserData, ExperimentData, ExperimentFileData
from os import path
BASE_DIR = path.dirname(path.abspath(__file__))
db_name = path.join(BASE_DIR, 'site.db')
def with_db_session(func):
    def wrapper(*args, **kwargs): 
        conn = sqlite3.connect(db_name)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try: 
            result = func(conn.cursor(), *args, **kwargs)
            conn.commit()   
            return result
        except Exception as e: 
            conn.rollback()
            raise
        finally: 
            conn.close()
    return wrapper

@with_db_session
def create_table(cur: sqlite3.Cursor):
    cur.execute(f"""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT UNIQUE, 
        pwd_hash BLOB NOT NULL, 
        api_key_hash BLOB NOT NULL, 
        credits INTEGER DEFAULT 0
    );""")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, 
        name TEXT, 
        description TEXT,
        status TEXT, 
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS experiment_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id INTEGER, 
        filename TEXT, 
        file_data BLOB, 
        FOREIGN KEY(experiment_id) REFERENCES experiments(id)
    );

    """)
    

@with_db_session
def fetch_table_data(cur: sqlite3.Cursor, table: str):
    cur.execute("""
        SELECT *
        FROM ?;
        """, (table, ))
    rows = cur.fetchall()
    return rows




@with_db_session
def save_user_data(cur: sqlite3.Cursor, userdata: UserData):
    if not is_dataclass(userdata): 
        return "Invalid Data"
    cur.execute(f"""
        INSERT INTO users
        (username, pwd_hash, api_key_hash, credits)
        VALUES
        (:username, :pwd_hash, :api_key_hash, :credits)
        ON CONFLICT (username) DO NOTHING;

    """, asdict(userdata)
    )
    
@with_db_session
def save_experiment(cur: sqlite3.Cursor, experimentdata: ExperimentData):
    if not is_dataclass(experimentdata): 
        return "Invalid Data"
    cur.execute(f"""
        INSERT INTO experiments
        (user_id, description, status)
        VALUES
        (:user_id, :description, :status);

    """, asdict(experimentdata)
    )

@with_db_session
def save_experiment_file(cur: sqlite3.Cursor, experimentfile: ExperimentFileData):
    if not is_dataclass(experimentfile): 
        return "Invalid Data"
    cur.execute(f"""
        INSERT INTO experiment_files
        (experiment_id, filename, file_data)
        VALUES
        (:experiment_id, filename, file_data);

    """, asdict(experimentfile)
    )

if __name__ == '__main__': 
    create_table()