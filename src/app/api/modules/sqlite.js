import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function getModulesForPlanOption(planOptionId) {
  // Accepts string or int, extracts first integer if format is '1:1'
  let id = 1;
  if (typeof planOptionId === 'string') {
    if (planOptionId.includes(':')) {
      id = parseInt(planOptionId.split(':')[0], 10) || 1;
    } else {
      id = parseInt(planOptionId, 10) || 1;
    }
  } else if (typeof planOptionId === 'number') {
    id = planOptionId;
  }

  const db = await open({
    filename: process.cwd() + '/src/app/database/site.db',
    driver: sqlite3.Database
  });

  // If you have a modules table, adjust the query accordingly
  let modules = await db.all(
    'SELECT * FROM modules WHERE subscription_plan_option_id = ?',
    id
  );
  // If no modules found for the plan option, return all modules as fallback
  if (!modules || modules.length === 0) {
    modules = await db.all('SELECT * FROM modules');
  }
  await db.close();
  return modules;
}
