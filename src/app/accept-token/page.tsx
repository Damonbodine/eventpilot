"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function AcceptTokenInner() {
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Signing in...");

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
      return;
    }

    const token = searchParams.get("token");
    if (!token || !signIn) return;

    (async () => {
      try {
        // Clerk v7 uses signIn.ticket() for ticket-based sign-in
        const result = await (signIn as any).ticket({ ticket: token });
        if (result?.error) {
          setMsg("Error: " + result.error.message);
        } else {
          // Ticket sign-in auto-sets the session in v7
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: Array<{ code: string; message: string }> };
        if (clerkErr.errors?.[0]?.code === "session_exists") {
          router.push("/dashboard");
        } else {
          // Fallback: try legacy create() API
          try {
            const result = await (signIn as any).create({ strategy: "ticket", ticket: token });
            if (result?.createdSessionId) {
              router.push("/dashboard");
            } else {
              setMsg("Error: " + (clerkErr.errors?.[0]?.message ?? String(err)));
            }
          } catch {
            setMsg("Error: " + (clerkErr.errors?.[0]?.message ?? String(err)));
          }
        }
      }
    })();
  }, [isSignedIn, searchParams, signIn, router]);

  return <div style={{ padding: 40 }}>{msg}</div>;
}

export default function AcceptTokenPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <AcceptTokenInner />
    </Suspense>
  );
}
