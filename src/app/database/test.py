import sqlite3

# Connect to the database
conn = sqlite3.connect('site.db')
cursor = conn.cursor()

# Example: Fetch all rows from a table named 'users'
cursor.execute("SELECT * FROM experiment")
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()