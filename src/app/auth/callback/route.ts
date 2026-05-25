import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const meta = user.user_metadata ?? {}
      const email = user.email ?? null
      const firstName = meta.given_name ?? meta.full_name?.split(' ')[0] ?? meta.name?.split(' ')[0] ?? null
      const lastName = meta.family_name ?? meta.full_name?.split(' ').slice(1).join(' ') ?? meta.name?.split(' ').slice(1).join(' ') ?? null

      // If redirecting back to a result, tag it with the user's identity
      const resultId = next.match(/\/results\/([^/?]+)/)?.[1]
      if (resultId) {
        await supabase
          .from('results')
          .update({ email, first_name: firstName, last_name: lastName })
          .eq('id', resultId)
      }
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
