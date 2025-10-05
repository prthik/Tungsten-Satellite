import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req) {
  try {
    const body = await req.json();
    const scriptPath = path.join(
      process.cwd(),
      "src",
      "app",
      "database",
      "cli.py"
    );
    const py = spawn("python", [scriptPath]);
    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (data) => { stdout += data.toString(); });
    py.stderr.on("data", (data) => { stderr += data.toString(); });
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
    try {
      await promise;
    } catch (err) {
      // Log and return stderr for debugging
      return NextResponse.json({ ok: false, error: String(err), stderr }, { status: 500 });
    }
    let parsed;
    try {
      parsed = stdout ? JSON.parse(stdout) : { ok: true };
    } catch (err) {
      parsed = { ok: false, error: "Invalid JSON from backend", raw: stdout, stderr };
    }
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    console.log("Fetching experiments...");
    const scriptPath = path.join(
      process.cwd(),
      "src",
      "app",
      "database",
      "cli.py"
    );
    console.log("Using script path:", scriptPath);
    const py = spawn("python", [scriptPath, "--list"]);

    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log("Received stdout:", data.toString());
    });
    py.stderr.on("data", (data) => {
      stderr += data.toString();
      console.log("Received stderr:", data.toString());
    });

    const promise = new Promise((resolve, reject) => {
      py.on("close", (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`python exited ${code}: ${stderr}`));
      });
      py.on("error", (err) => reject(err));
    });

    await promise;

    try {
      console.log("Raw stdout:", stdout);
      const parsed = stdout ? JSON.parse(stdout) : [];
      console.log("Parsed data:", parsed);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("Error parsing output:", err);
      return NextResponse.json(
        { error: "invalid output", raw: stdout },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
