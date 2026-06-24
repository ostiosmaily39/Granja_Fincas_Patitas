import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const schemes = [
    'hantivirus',
    'gripe',
    'newcastle',
    'bronquitis',
    'marek',
    'rabia',
    'leptospirosis',
    'brucelosis',
    'fiebre aftosa',
    'carbunclo',
    'parvovirus',
    'moquillo',
    'hepatitis',
    'leptospira',
    'coronavirus',
  ];

  return NextResponse.json(schemes);
}