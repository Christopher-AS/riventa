import { NextResponse } from "next/server";

type HealthResponse = {
  status: "ok";
  commit: string;
  time: string;
};

export async function GET(): Promise<Response> {
  const payload: HealthResponse = {
    status: "ok",
    commit: process.env.COMMIT_SHA ?? "dev",
    time: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
