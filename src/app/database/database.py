# Methods for static module_type table
import sqlite3
from data import ModuleType, UserData, ExperimentData, ExperimentFileData, PayloadBuilderData, PayloadBuilderItemData

def get_all_module_types():
    conn = sqlite3.connect('site.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name FROM module_type')
    rows = cursor.fetchall()
    conn.close()
    return [ModuleType(id=row[0], name=row[1]) for row in rows]

def add_module_type():
    conn = sqlite3.connect('site.db')
    cursor = conn.cursor()
    modules = ['Camera', 'µLab', 'Comms', 'Battery', 'AI Module', 'Computer', 'Propulsion']
    for mod in modules:
        cursor.execute('INSERT INTO module_type (name) VALUES (?)', (mod,))
    conn.commit()
    conn.close()
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

    cur.execute("""
    CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        w INTEGER,
        h INTEGER,
        massKg REAL
    );
    """)

@with_db_session
def fetch_table_data(cur: sqlite3.Cursor, table: str):
    cur.execute(f"SELECT * FROM {table};")
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

import json
# Save a payload builder row and modules
@with_db_session
def save_payload_builder(cur: sqlite3.Cursor, builder: dict, modules: list = None):
    cur.execute("""
        INSERT INTO payload_builders
        (name, bay_width, bay_height, items_json, created_at)
        VALUES
        (:name, :bay_width, :bay_height, :items_json, :created_at);
    """, builder)
    builder_id = cur.lastrowid
    # Save modules if provided
    if modules:
        for mod in modules:
            cur.execute("""
                INSERT OR IGNORE INTO modules (name, w, h, massKg)
                VALUES (?, ?, ?, ?)
            """, (mod['name'], mod['w'], mod['h'], mod['massKg']))
    return builder_id

# Get a payload builder by id
@with_db_session
def get_payload_builder(cur: sqlite3.Cursor, builder_id: int):
    cur.execute("SELECT id, name, bay_width, bay_height, items_json, created_at FROM payload_builders WHERE id = ?", (builder_id,))
    row = cur.fetchone()
    return dict(row) if row else None

# Delete a payload builder by id
@with_db_session
def delete_payload_builder(cur: sqlite3.Cursor, builder_id: int):
    cur.execute("DELETE FROM payload_builders WHERE id = ?", (builder_id,))
    return cur.rowcount


@with_db_session
def get_all_experiments(cur: sqlite3.Cursor):
    # Fetch experiments
    cur.execute("SELECT id, user_id, name, description, status, payload FROM experiments ORDER BY id DESC")
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

if __name__ == '__main__': 
    create_table()

# Cleanup all tables for a fresh database
@with_db_session
def cleanup_database(cur: sqlite3.Cursor):
    cur.execute("DELETE FROM experiment_files;")
    cur.execute("DELETE FROM experiments;")
    cur.execute("DELETE FROM payload_builders;")
    cur.execute("DELETE FROM modules;")
    cur.execute("DELETE FROM users;")
    return "Database cleaned."

# Fetch all modules
@with_db_session
def get_modules(cur: sqlite3.Cursor):
    cur.execute("SELECT id, name, w, h, massKg FROM modules ORDER BY id ASC")
    rows = cur.fetchall()
    return [dict(row) for row in rows]