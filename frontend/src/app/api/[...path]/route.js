import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export async function GET(request) {
  return proxy("GET", request);
}

export async function POST(request) {
  return proxy("POST", request);
}

export async function PUT(request) {
  return proxy("PUT", request);
}

export async function PATCH(request) {
  return proxy("PATCH", request);
}

export async function DELETE(request) {
  return proxy("DELETE", request);
}

async function proxy(method, request) {
  const path =
    request.nextUrl.pathname.replace(/^\/api/, "").replace(/^\//, "") || "";

  const backendUrl = `${BACKEND_URL.replace(/\/+$/, "")}/${path}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("x-middleware-terminal");
  headers.delete("x-middleware-match");

  const sinCuerpo = method === "GET" || method === "HEAD";

  try {
    // Se lee el cuerpo completo antes de reenviarlo: un ReadableStream
    // requiere la opción `duplex` y provocaría un 502 en el proxy.
    const body = sinCuerpo ? undefined : await request.arrayBuffer();

    const backendRes = await fetch(backendUrl, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
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
