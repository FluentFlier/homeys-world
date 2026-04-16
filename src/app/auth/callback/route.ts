import { NextResponse, type NextRequest } from 'next/server'

// InsForge SDK handles OAuth callbacks automatically via insforge_code query param
// This route is kept as a fallback redirect
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/`)
}
