import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle InsForge OAuth callback - detect insforge_code in query params
  const url = request.nextUrl
  const insforgeCode = url.searchParams.get('insforge_code')

  if (insforgeCode) {
    // Let the client-side SDK handle the code exchange
    // Just pass through to the page
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
