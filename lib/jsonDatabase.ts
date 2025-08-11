// JSON-based data storage for Vercel deployment
// This replaces SQLite database functionality for events and routes

import fs from "fs/promises";
import path from "path";
import { kv } from "@vercel/kv";
import { Redis } from "@upstash/redis";

// Detect if KV or Upstash is available (prod)
const USE_KV = Boolean(process.env.KV_REST_API_URL || process.env.KV_URL);
const USE_UPSTASH = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Upstash client if configured
const upstash = USE_UPSTASH
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    })
  : (null as unknown as Redis);

// Types
export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface RunRoute {
  id: number;
  name: string;
  description: string;
  distance: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  estimatedTime: string;
  points: RoutePoint[];
  isUpcoming: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  badge: string;
  title: string;
  description: string;
  date: string;
  location: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Data file paths (used only in local dev fallback)
const DATA_DIR = path.join(process.cwd(), "data");
const ROUTES_FILE = path.join(DATA_DIR, "routes.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

// Helper function to ensure data directory exists (local only)
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Helper function to read JSON file (local only)
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    // File doesn't exist or is invalid, return default and create file
    await writeJsonFile(filePath, defaultValue);
    return defaultValue;
  }
}

// Helper function to write JSON file (local only)
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// KV helpers
const ROUTES_KEY = "routes";
const EVENTS_KEY = "events";

async function kvGet<T>(key: string, fallback: T): Promise<T> {
  if (USE_KV) {
    const val = await kv.get<unknown>(key);
    return (val as T) ?? fallback;
  }
  if (USE_UPSTASH) {
    const val = await upstash.get<string | null>(key);
    if (typeof val === "string") {
      try {
        return JSON.parse(val) as T;
      } catch {
        return fallback;
      }
    }
    return (val as unknown as T) ?? fallback;
  }
  return fallback;
}

async function kvSet<T = unknown>(key: string, value: T): Promise<void> {
  if (USE_KV) {
    await kv.set<T>(key, value);
    return;
  }
  if (USE_UPSTASH) {
    await upstash.set(key, JSON.stringify(value));
    return;
  }
}

// Routes functions
export async function getAllRoutes(): Promise<RunRoute[]> {
  if (USE_KV || USE_UPSTASH) {
    return await kvGet<RunRoute[]>(ROUTES_KEY, []);
  }
  return await readJsonFile<RunRoute[]>(ROUTES_FILE, []);
}

export async function getUpcomingRoute(): Promise<RunRoute | null> {
  const routes = await getAllRoutes();
  return routes.find((route) => route.isUpcoming) || null;
}

export async function addRoute(
  route: Omit<RunRoute, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const routes = await getAllRoutes();
  const newId =
    routes.length > 0 ? Math.max(...routes.map((r) => r.id)) + 1 : 1;
  const timestamp = new Date().toISOString();

  const newRoute: RunRoute = {
    ...route,
    id: newId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  routes.push(newRoute);

  if (USE_KV || USE_UPSTASH) {
    await kvSet(ROUTES_KEY, routes);
  } else {
    await writeJsonFile(ROUTES_FILE, routes);
  }

  return newId;
}

export async function updateRoute(
  id: number,
  updates: Partial<Omit<RunRoute, "id" | "createdAt">>
): Promise<void> {
  const routes = await getAllRoutes();
  const routeIndex = routes.findIndex((route) => route.id === id);

  if (routeIndex === -1) {
    throw new Error(`Route with id ${id} not found`);
  }

  routes[routeIndex] = {
    ...routes[routeIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (USE_KV || USE_UPSTASH) {
    await kvSet(ROUTES_KEY, routes);
  } else {
    await writeJsonFile(ROUTES_FILE, routes);
  }
}

export async function deleteRoute(id: number): Promise<void> {
  const routes = await getAllRoutes();
  const filteredRoutes = routes.filter((route) => route.id !== id);

  if (filteredRoutes.length === routes.length) {
    throw new Error(`Route with id ${id} not found`);
  }

  if (USE_KV || USE_UPSTASH) {
    await kvSet(ROUTES_KEY, filteredRoutes);
  } else {
    await writeJsonFile(ROUTES_FILE, filteredRoutes);
  }
}

export async function setUpcomingRoute(id: number): Promise<void> {
  const routes = await getAllRoutes();

  // First, unset all routes as upcoming
  routes.forEach((route) => {
    route.isUpcoming = false;
    route.updatedAt = new Date().toISOString();
  });

  // Then set the specified route as upcoming
  const targetRoute = routes.find((route) => route.id === id);
  if (!targetRoute) {
    throw new Error(`Route with id ${id} not found`);
  }

  targetRoute.isUpcoming = true;
  targetRoute.updatedAt = new Date().toISOString();

  if (USE_KV || USE_UPSTASH) {
    await kvSet(ROUTES_KEY, routes);
  } else {
    await writeJsonFile(ROUTES_FILE, routes);
  }
}

// Events functions
export async function getAllEvents(): Promise<Event[]> {
  if (USE_KV || USE_UPSTASH) {
    return await kvGet<Event[]>(EVENTS_KEY, []);
  }
  return await readJsonFile<Event[]>(EVENTS_FILE, []);
}

export async function addEvent(
  event: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const events = await getAllEvents();
  const newId =
    events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
  const timestamp = new Date().toISOString();

  const newEvent: Event = {
    ...event,
    id: newId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  events.push(newEvent);

  if (USE_KV || USE_UPSTASH) {
    await kvSet(EVENTS_KEY, events);
  } else {
    await writeJsonFile(EVENTS_FILE, events);
  }

  return newId;
}

export async function updateEvent(
  id: number,
  updates: Partial<Omit<Event, "id" | "createdAt">>
): Promise<void> {
  const events = await getAllEvents();
  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    throw new Error(`Event with id ${id} not found`);
  }

  events[eventIndex] = {
    ...events[eventIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (USE_KV || USE_UPSTASH) {
    await kvSet(EVENTS_KEY, events);
  } else {
    await writeJsonFile(EVENTS_FILE, events);
  }
}

export async function deleteEvent(id: number): Promise<void> {
  const events = await getAllEvents();
  const filteredEvents = events.filter((event) => event.id !== id);

  if (filteredEvents.length === events.length) {
    throw new Error(`Event with id ${id} not found`);
  }

  if (USE_KV || USE_UPSTASH) {
    await kvSet(EVENTS_KEY, filteredEvents);
  } else {
    await writeJsonFile(EVENTS_FILE, filteredEvents);
  }
}

// Registration functions (for export functionality)
// Since we're using Google Forms now, this returns empty array
export async function getAllRegistrations(): Promise<unknown[]> {
  // Registrations are now handled by Google Forms
  // This function exists for compatibility but returns empty array
  return [];
}
