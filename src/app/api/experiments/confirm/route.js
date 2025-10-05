import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req) {
  try {
    const body = await req.json();
    // body: { experiment_id, status, notes }
    const scriptPath = path.join(
      process.cwd(),
      "src",
      "app",
      "database",
      "cli.py"
    );
    const py = spawn("python", [scriptPath, "--confirm"]);

    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const promise = new Promise((resolve, reject) => {
      py.on("close", (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`python exited ${code}: ${stderr}`));
      });
      py.on("error", (err) => reject(err));
    });

    // Write JSON to stdin
    py.stdin.write(JSON.stringify(body));
    py.stdin.end();

    await promise;

    let parsed;
    try {
      parsed = stdout ? JSON.parse(stdout) : { ok: true };
    } catch (err) {
      parsed = { ok: false, error: "Invalid JSON from backend", raw: stdout };
    }
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
