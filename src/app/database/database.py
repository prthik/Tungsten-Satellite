
import sqlite3
from dataclasses import dataclass, asdict, is_dataclass
from data import UserData, ExperimentData, ExperimentFileData, PayloadBuilderData, PayloadBuilderItemData, SubscriptionPlan, UserSubscription, PlanOption
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

# Update status and notes for an experiment
@with_db_session
def update_experiment_confirmation(cur: sqlite3.Cursor, experiment_id: int, status: str, notes: str):
    cur.execute("""
        UPDATE experiments
        SET status = ?, notes = ?
        WHERE id = ?;
    """, (status, notes, experiment_id))
    return cur.rowcount

@with_db_session
def drop_users_table(cur: sqlite3.Cursor):
    cur.execute("DROP TABLE IF EXISTS users;")
    return "users table dropped."

def add_column_if_not_exists(cur: sqlite3.Cursor, table: str, column: str, type: str):
    cur.execute(f"SELECT COUNT(*) FROM pragma_table_info('{table}') WHERE name='{column}'")
    if cur.fetchone()[0] == 0:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type}")

@with_db_session
def create_table(cur: sqlite3.Cursor):
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT UNIQUE, 
        pwd_hash BLOB NOT NULL, 
        api_key_hash BLOB NOT NULL, 
        credits_available INTEGER DEFAULT 0,
        subscriptionplan_id INTEGER DEFAULT 0
    )""")
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        status TEXT,
        payload TEXT,
        notes TEXT,
        user_email TEXT,
        created_at TEXT,
        experimentType TEXT,
        ModulesNeeded TEXT
    )""")

    # Add new columns if they don't exist
    add_column_if_not_exists(cur, "experiments", "notes", "TEXT")
    add_column_if_not_exists(cur, "experiments", "user_email", "TEXT")
    add_column_if_not_exists(cur, "experiments", "created_at", "TEXT")
    add_column_if_not_exists(cur, "experiments", "experimentType", "TEXT")
    add_column_if_not_exists(cur, "experiments", "ModulesNeeded", "TEXT")

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

    cur.execute("""
    CREATE TABLE IF NOT EXISTS subscription_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credits_to_buy INTEGER DEFAULT 0,
        plan_option_id INTEGER DEFAULT 0
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        plan_id INTEGER,
        credits_available INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(plan_id) REFERENCES subscription_plans(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS plan_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        perks TEXT
    );
    """)

@with_db_session
def fetch_table_data(cur: sqlite3.Cursor, table: str):
    cur.execute(f"SELECT * FROM {table};")
    rows = cur.fetchall()
    return rows



# CRUD for subscription plans
@with_db_session
def create_subscription_plan(cur: sqlite3.Cursor, plan: SubscriptionPlan):
    cur.execute("INSERT INTO subscription_plans (credits_to_buy, plan_option_id) VALUES (?, ?)", (plan.credits_to_buy, plan.plan_option_id))
    return cur.lastrowid

@with_db_session
def get_subscription_plan(cur: sqlite3.Cursor, plan_id: int):
    cur.execute("SELECT * FROM subscription_plans WHERE id = ?", (plan_id,))
    row = cur.fetchone()
    return SubscriptionPlan(**row) if row else None

@with_db_session
def update_subscription_plan(cur: sqlite3.Cursor, plan: SubscriptionPlan):
    cur.execute("UPDATE subscription_plans SET credits_to_buy=?, plan_option_id=? WHERE id=?", (plan.credits_to_buy, plan.plan_option_id, plan.id))
    return cur.rowcount

@with_db_session
def delete_subscription_plan(cur: sqlite3.Cursor, plan_id: int):
    cur.execute("DELETE FROM subscription_plans WHERE id=?", (plan_id,))
    return cur.rowcount

# CRUD for user subscriptions
@with_db_session
def create_user_subscription(cur: sqlite3.Cursor, sub: UserSubscription):
    cur.execute("INSERT INTO user_subscriptions (user_id, plan_id, credits_available) VALUES (?, ?, ?)", (sub.user_id, sub.plan_id, sub.credits_available))
    return cur.lastrowid

@with_db_session
def get_user_subscription(cur: sqlite3.Cursor, user_id: int):
    cur.execute("SELECT * FROM user_subscriptions WHERE user_id = ?", (user_id,))
    row = cur.fetchone()
    return UserSubscription(**row) if row else None

@with_db_session
def update_user_subscription(cur: sqlite3.Cursor, sub: UserSubscription):
    cur.execute("UPDATE user_subscriptions SET plan_id=?, credits_available=? WHERE user_id=?", (sub.plan_id, sub.credits_available, sub.user_id))
    return cur.rowcount

@with_db_session
def delete_user_subscription(cur: sqlite3.Cursor, user_id: int):
    cur.execute("DELETE FROM user_subscriptions WHERE user_id=?", (user_id,))
    return cur.rowcount

    @staticmethod
    def seed_options(cur):
        for opt in DashboardOptions.DEFAULT_OPTIONS:
            cur.execute(
                "INSERT OR IGNORE INTO plan_options (name, perks) VALUES (?, ?)",
                (opt.name, opt.perks)
            )

    @staticmethod
    def get_options(cur):
        cur.execute("SELECT id, name, perks FROM plan_options ORDER BY id ASC")
        rows = cur.fetchall()
        return [PlanOption(**row) for row in rows]

# CRUD for plan options
@with_db_session
def create_plan_option(cur: sqlite3.Cursor, option: PlanOption):
    cur.execute("INSERT INTO plan_options (name, perks) VALUES (?, ?)", (option.name, option.perks))
    return cur.lastrowid

@with_db_session
def get_plan_option(cur: sqlite3.Cursor, option_id: int):
    cur.execute("SELECT * FROM plan_options WHERE id = ?", (option_id,))
    row = cur.fetchone()
    return PlanOption(**row) if row else None

@with_db_session
def update_plan_option(cur: sqlite3.Cursor, option: PlanOption):
    cur.execute("UPDATE plan_options SET name=?, perks=? WHERE id=?", (option.name, option.perks, option.id))
    return cur.rowcount

@with_db_session
def delete_plan_option(cur: sqlite3.Cursor, option_id: int):
    cur.execute("DELETE FROM plan_options WHERE id=?", (option_id,))
    return cur.rowcount


@with_db_session
def save_user_data(cur: sqlite3.Cursor, userdata: UserData):
    if not is_dataclass(userdata): 
        return "Invalid Data"
    cur.execute(f"""
        INSERT INTO users
        (username, pwd_hash, api_key_hash, credits_available, subscriptionplan_id)
        VALUES
        (:username, :pwd_hash, :api_key_hash, :credits_available, :subscriptionplan_id)
        ON CONFLICT (username) DO NOTHING;
    """, asdict(userdata))
    
@with_db_session
def save_experiment(cur: sqlite3.Cursor, experimentdata: ExperimentData):
    if not is_dataclass(experimentdata): 
        return "Invalid Data"
    try:
        data = asdict(experimentdata)
        cur.execute("""
            INSERT INTO experiments
            (name, description, status, payload, notes, user_email, created_at, experimentType, ModulesNeeded)
            VALUES
            (:name, :description, :status, :payload, :notes, :user_email, :created_at, :experimentType, :ModulesNeeded)
        """, data)
        return cur.lastrowid
    except Exception as e:
        print(f"Error saving experiment: {str(e)}")
        print(f"Data being saved: {data}")
        raise

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
    # Fetch experiments with all fields
    cur.execute("""
        SELECT id, name, description, status, payload, notes, 
               user_email, created_at, experimentType, ModulesNeeded 
        FROM experiments 
        ORDER BY id DESC""")
    ex_rows = cur.fetchall()
    results = []
    for ex in ex_rows:
        ex_id = ex['id']
        cur.execute("SELECT id, filename, length(file_data) as size FROM experiment_files WHERE experiment_id = ?", (ex_id,))
        files = [dict(row) for row in cur.fetchall()]
        results.append({
            'id': ex_id,
            'name': ex['name'],
            'description': ex['description'],
            'status': ex['status'],
            'payload': ex['payload'],
            'notes': ex['notes'],
            'user_email': ex['user_email'],
            'created_at': ex['created_at'],
            'experimentType': ex['experimentType'],
            'ModulesNeeded': ex['ModulesNeeded'],
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