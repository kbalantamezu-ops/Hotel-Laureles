import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:5000/api";

export async function GET(request) {
  return proxy("GET", request);
}

export async function POST(request) {
  return proxy("POST", request);
}

export async function PUT(request) {
  return proxy("PUT", request);
}

export async function DELETE(request) {
  return proxy("DELETE", request);
}

async function proxy(method, request) {
  const path =
    request.nextUrl.pathname.replace(/^\/api/, "").replace(/^\//, "") || "";

  const backendUrl = `${BACKEND_URL}/${path}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("x-middleware-terminal");
  headers.delete("x-middleware-match");

  try {
    const backendRes = await fetch(backendUrl, {
      method,
      headers,
      body:
        method === "GET" || method === "HEAD"
          ? undefined
          : request.body,
    });

    const responseHeaders = new Headers(backendRes.headers);
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-encoding");

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new NextResponse(
      JSON.stringify({ mensaje: "No se pudo contactar el backend." }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
