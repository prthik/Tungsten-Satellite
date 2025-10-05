import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET() {
  const db = await open({
    filename: path.join(process.cwd(), 'src/app/database/site.db'),
    driver: sqlite3.Database
  });
  const subs = await db.all('SELECT * FROM user_subscriptions');
  await db.close();
  return NextResponse.json(subs);
}
