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
        payload TEXT,
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
    # Ensure payload column exists (SQLite doesn't have ALTER ... IF NOT EXISTS)
    cur.execute("PRAGMA table_info(experiments)")
    cols = [r['name'] for r in cur.fetchall()]
    if 'payload' not in cols:
        cur.execute("ALTER TABLE experiments ADD COLUMN payload TEXT;")

    # Create payload_builders table if missing
    cur.execute("""
    CREATE TABLE IF NOT EXISTS payload_builders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        bay_width INTEGER,
        bay_height INTEGER,
        items_json TEXT,
        created_at TEXT
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
        (user_id, name, description, status, payload)
        VALUES
        (:user_id, :name, :description, :status, :payload);

    """, asdict(experimentdata)
    )
    return cur.lastrowid

@with_db_session
def save_experiment_file(cur: sqlite3.Cursor, experimentfile: ExperimentFileData):
    if not is_dataclass(experimentfile): 
        return "Invalid Data"
    cur.execute(f"""
        INSERT INTO experiment_files
        (experiment_id, filename, file_data)
        VALUES
        (:experiment_id, :filename, :file_data);

    """, asdict(experimentfile)
    )


@with_db_session
def get_all_experiments(cur: sqlite3.Cursor):
    # Fetch experiments
    cur.execute("SELECT id, user_id, name, description, status FROM experiments ORDER BY id DESC")
    ex_rows = cur.fetchall()
    results = []
    for ex in ex_rows:
        ex_id = ex['id']
        cur.execute("SELECT id, filename, length(file_data) as size FROM experiment_files WHERE experiment_id = ?", (ex_id,))
        files = [dict(row) for row in cur.fetchall()]
        results.append({
            'id': ex_id,
            'user_id': ex['user_id'],
            'name': ex['name'],
            'description': ex['description'],
            'status': ex['status'],
            'payload': ex['payload'],
            'files': files
        })
    return results


@with_db_session
def save_payload_builder(cur: sqlite3.Cursor, builder: dict):
    # builder: {name, bay_width, bay_height, items_json, created_at}
    cur.execute("""
        INSERT INTO payload_builders
        (name, bay_width, bay_height, items_json, created_at)
        VALUES
        (:name, :bay_width, :bay_height, :items_json, :created_at);
    """, builder)
    return cur.lastrowid


@with_db_session
def get_all_payload_builders(cur: sqlite3.Cursor):
    cur.execute("SELECT id, name, bay_width, bay_height, items_json, created_at FROM payload_builders ORDER BY id DESC")
    rows = cur.fetchall()
    return [dict(r) for r in rows]

if __name__ == '__main__': 
    create_table()