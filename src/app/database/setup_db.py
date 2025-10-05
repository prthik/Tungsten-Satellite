import sqlite3
import json
from datetime import datetime

# Connect to database
conn = sqlite3.connect('site.db')
cur = conn.cursor()

# Create tables
cur.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    pwd_hash BLOB NOT NULL,
    api_key_hash BLOB NOT NULL,
    credits_available INTEGER DEFAULT 0,
    subscriptionplan_id INTEGER DEFAULT 0
)''')

# Drop and recreate experiments table
cur.execute('DROP TABLE IF EXISTS experiments')
cur.execute('''
CREATE TABLE experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    description TEXT,
    status TEXT,
    payload TEXT,
    confirmed INTEGER,
    confirmation_notes TEXT,
    user_email TEXT,
    created_at TEXT,
    experimentType TEXT,
    ModulesNeeded TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)''')

# Create test experiment
test_exp = {
    'user_id': None,
    'name': 'Test Experiment',
    'description': 'This is a test experiment',
    'status': 'new',
    'payload': json.dumps({'test': True}),
    'confirmed': 0,
    'confirmation_notes': None,
    'user_email': 'test@example.com',
    'created_at': datetime.now().isoformat(),
    'experimentType': 'Test Type',
    'ModulesNeeded': 'Test Modules'
}

# Insert test experiment
cur.execute('''
INSERT INTO experiments 
(user_id, name, description, status, payload, confirmed, confirmation_notes, user_email, created_at, experimentType, ModulesNeeded)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', (
    test_exp['user_id'], test_exp['name'], test_exp['description'], test_exp['status'],
    test_exp['payload'], test_exp['confirmed'], test_exp['confirmation_notes'],
    test_exp['user_email'], test_exp['created_at'], test_exp['experimentType'],
    test_exp['ModulesNeeded']
))

conn.commit()

# Verify
cur.execute('SELECT * FROM experiments')
rows = cur.fetchall()
print(f'Total experiments in database: {len(rows)}')
if rows:
    print('Last experiment:', rows[-1])

conn.close()
