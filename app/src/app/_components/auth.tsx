'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export function Auth() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-xl">Hi {session.user?.email}!</p>
        <button onClick={() => signOut()} className="rounded-full bg-red-600 px-4 py-2 text-white hover:bg-red-700">
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xl">Please sign in</p>
      <div className="flex gap-2">
        <button
          onClick={() => signIn('github')}
          className="rounded-full bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          Sign in with GitHub
        </button>
        <button
          onClick={() => signIn('twitter')}
          className="rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Sign in with Twitter
        </button>
      </div>
    </div>
  )
}
