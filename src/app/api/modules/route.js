import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const planOptionId = parseInt(searchParams.get('plan_option_id'), 10) || 1;
    const scriptPath = path.join(process.cwd(), 'src', 'app', 'database', 'cli.py');
    const py = spawn('python3', [scriptPath, '--modules', '--plan_option_id', String(planOptionId)]);

    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (data) => { stdout += data.toString(); });
    py.stderr.on('data', (data) => { stderr += data.toString(); });

    const promise = new Promise((resolve, reject) => {
      py.on('close', (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`python exited ${code}: ${stderr}`));
      });
      py.on('error', (err) => reject(err));
    });

    await promise;

    try {
      const parsed = stdout ? JSON.parse(stdout) : { modules: [] };
      return NextResponse.json(parsed);
    } catch (err) {
      console.error('JSON parse error:', err, 'Raw output:', stdout, 'Stderr:', stderr);
      return NextResponse.json({ error: 'invalid output', raw: stdout, stderr }, { status: 500 });
    }
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
