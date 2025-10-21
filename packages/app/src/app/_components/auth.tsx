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
        <p className="text-xl">Hi {session.user?.name}!</p>
        <p>
          You are associated with @{session.user.provider}/{session.user.username}
        </p>
        <button onClick={() => signOut()} className="rounded-full bg-danger px-4 py-2 text-white hover:bg-danger-600">
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
          className="rounded-full bg-default-200 px-4 py-2 text-default-900 hover:bg-default-300"
        >
          Sign in with GitHub
        </button>
        <button
          onClick={() => signIn('twitter')}
          className="rounded-full bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Sign in with Twitter
        </button>
      </div>
    </div>
  )
}
