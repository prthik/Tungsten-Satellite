import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET() {
  const db = await open({
    filename: path.join(process.cwd(), 'src/app/database/site.db'),
    driver: sqlite3.Database
  });
  const users = await db.all('SELECT * FROM users');
  await db.close();
  return NextResponse.json(users);
}
