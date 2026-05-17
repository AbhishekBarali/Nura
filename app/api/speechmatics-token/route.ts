import { NextResponse } from "next/server";

// Generate a temporary JWT for browser-side Speechmatics real-time connection
export async function GET() {
  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Speechmatics API key not configured" }, { status: 500 });
  }

  try {
    // Request a short-lived token from Speechmatics management platform
    const response = await fetch("https://mp.speechmatics.com/v1/api_keys?type=rt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ttl: 3600 }), // 1 hour TTL
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Speechmatics token error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to generate Speechmatics token" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.key_value });
  } catch (error) {
    console.error("Speechmatics token generation failed:", error);
    return NextResponse.json(
      { error: "Token generation failed" },
      { status: 500 }
    );
  }
}
