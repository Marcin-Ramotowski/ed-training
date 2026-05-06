import { NextResponse } from 'next/server';
import { readFlights, writeFlights, resetToSeed } from '@/lib/flights';
import {
  ALL_STATUSES,
  ALL_AIRLINES,
  ALL_TERMINALS,
  type Flight,
  type FlightStatus,
  type Airline,
  type Terminal,
} from '@/types';

export async function GET() {
  const flights = readFlights();
  return NextResponse.json(flights);
}

// PATCH /api/flights — update a single flight by id
// Body: { id: string, ...partialFlight }
export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const { id } = data;

  if (typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json({ error: 'id must be a non-empty string' }, { status: 400 });
  }

  // Whitelist allowed update fields — id cannot be overwritten
  const ALLOWED_KEYS: Array<keyof Omit<Flight, 'id'>> = [
    'flightNumber', 'airline', 'destination', 'departureTime',
    'terminal', 'gate', 'status', 'delayMinutes',
  ];
  const updates: Partial<Omit<Flight, 'id'>> = {};
  for (const key of ALLOWED_KEYS) {
    if (key in data) updates[key] = data[key] as never;
  }

  if ('status' in updates && !ALL_STATUSES.includes(updates.status as FlightStatus)) {
    return NextResponse.json({ error: `status must be one of: ${ALL_STATUSES.join(', ')}` }, { status: 400 });
  }
  if ('airline' in updates && !ALL_AIRLINES.includes(updates.airline as Airline)) {
    return NextResponse.json({ error: `airline must be one of: ${ALL_AIRLINES.join(', ')}` }, { status: 400 });
  }
  if ('terminal' in updates && !ALL_TERMINALS.includes(updates.terminal as Terminal)) {
    return NextResponse.json({ error: `terminal must be one of: ${ALL_TERMINALS.join(', ')}` }, { status: 400 });
  }
  if ('departureTime' in updates && !/^\d{2}:\d{2}$/.test(updates.departureTime as string)) {
    return NextResponse.json({ error: 'departureTime must be in HH:MM format' }, { status: 400 });
  }
  if ('delayMinutes' in updates) {
    const delay = updates.delayMinutes;
    if (typeof delay !== 'number' || !Number.isInteger(delay) || delay < 0) {
      return NextResponse.json({ error: 'delayMinutes must be a non-negative integer' }, { status: 400 });
    }
  }

  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  }

  flights[index] = { ...flights[index], ...updates };
  writeFlights(flights);

  return NextResponse.json(flights[index]);
}

// POST /api/flights — add a new flight
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  const requiredStringFields = ['id', 'flightNumber', 'destination', 'departureTime', 'gate'] as const;
  for (const field of requiredStringFields) {
    if (typeof data[field] !== 'string' || (data[field] as string).trim() === '') {
      return NextResponse.json({ error: `${field} is required and must be a non-empty string` }, { status: 400 });
    }
  }

  if (!ALL_STATUSES.includes(data.status as FlightStatus)) {
    return NextResponse.json({ error: `status must be one of: ${ALL_STATUSES.join(', ')}` }, { status: 400 });
  }
  if (!ALL_AIRLINES.includes(data.airline as Airline)) {
    return NextResponse.json({ error: `airline must be one of: ${ALL_AIRLINES.join(', ')}` }, { status: 400 });
  }
  if (!ALL_TERMINALS.includes(data.terminal as Terminal)) {
    return NextResponse.json({ error: `terminal must be one of: ${ALL_TERMINALS.join(', ')}` }, { status: 400 });
  }
  if (!/^\d{2}:\d{2}$/.test(data.departureTime as string)) {
    return NextResponse.json({ error: 'departureTime must be in HH:MM format' }, { status: 400 });
  }
  if (data.delayMinutes !== undefined) {
    const delay = data.delayMinutes;
    if (typeof delay !== 'number' || !Number.isInteger(delay) || delay < 0) {
      return NextResponse.json({ error: 'delayMinutes must be a non-negative integer' }, { status: 400 });
    }
  }

  const flights = readFlights();

  if (flights.some((f) => f.id === data.id)) {
    return NextResponse.json({ error: 'Flight with this id already exists' }, { status: 409 });
  }

  const flight: Flight = {
    id: data.id as string,
    flightNumber: data.flightNumber as string,
    airline: data.airline as Airline,
    destination: data.destination as string,
    departureTime: data.departureTime as string,
    terminal: data.terminal as Terminal,
    gate: data.gate as string,
    status: data.status as FlightStatus,
    ...(data.delayMinutes !== undefined && { delayMinutes: data.delayMinutes as number }),
  };

  flights.push(flight);
  writeFlights(flights);
  return NextResponse.json(flight, { status: 201 });
}

// DELETE /api/flights — remove a flight by id
export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 });
  }

  const { id } = body as Record<string, unknown>;

  if (typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json({ error: 'id must be a non-empty string' }, { status: 400 });
  }

  const flights = readFlights();

  if (!flights.some((f) => f.id === id)) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  }

  writeFlights(flights.filter((f) => f.id !== id));
  return NextResponse.json({ success: true });
}
