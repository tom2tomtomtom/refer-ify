import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to Refer-ify</h1>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-green-600">✅ You are signed in as: {user.email}</p>
            <div className="space-y-2">
              <p>Visit your dashboard:</p>
              <div className="flex flex-col gap-2">
                <Link href="/client" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Client Dashboard
                </Link>
                <Link href="/candidate" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Candidate Dashboard
                </Link>
                <Link href="/select-circle" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  Select Circle Dashboard
                </Link>
                <Link href="/founding-circle" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                  Founding Circle Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-red-600">❌ You are not signed in</p>
            <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";