import sqlite3
import json

# Connect to database and get experiments
conn = sqlite3.connect('site.db')
cur = conn.cursor()

# Get all experiments
cur.execute("""
    SELECT id, user_id, name, description, status, payload, confirmed, confirmation_notes, user_email, created_at, experimentType, ModulesNeeded 
    FROM experiments 
    ORDER BY id DESC
""")

rows = cur.fetchall()
print("Raw database rows:")
print(rows)

# Convert to list of dicts
column_names = [description[0] for description in cur.description]
results = []
for row in rows:
    experiment = dict(zip(column_names, row))
    print("\nExperiment details:")
    for key, value in experiment.items():
        print(f"{key}: {value}")
    results.append(experiment)

# Format like the API response
print("\nFinal JSON output:")
print(json.dumps(results, indent=2))

conn.close()
