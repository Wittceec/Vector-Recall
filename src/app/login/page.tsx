import { login, signup } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto h-screen">
      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <h1 className="text-2xl font-semibold mb-6">Sign in to Vector Recall</h1>
        
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-[#1b2029] mb-6 text-[#e7e9ee]"
          name="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-[#1b2029] mb-6 text-[#e7e9ee]"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button
          formAction={login}
          className="bg-[oklch(0.82_0.13_195)] text-[#08090c] rounded-md px-4 py-2 mb-2 font-medium"
        >
          Sign In
        </button>
        <button
          formAction={signup}
          className="border border-[#1b2029] text-[#aab1bd] rounded-md px-4 py-2 mb-2 font-medium"
        >
          Sign Up
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-[#181c25] text-center text-[oklch(0.72_0.14_330)]">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
