import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Welcome back, {session.user.name?.split(" ")[0]}
      </h1>
      <p className="text-white/50 mb-8">
        Here&quot;s your content intelligence overview from Threads.
      </p>
    </div>
  )
}
