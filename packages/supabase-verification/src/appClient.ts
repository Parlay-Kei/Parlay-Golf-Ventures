import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(baseUrl + path);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(baseUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}