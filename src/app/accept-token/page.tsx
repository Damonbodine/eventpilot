"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function AcceptTokenInner() {
  const { isSignedIn } = useAuth();
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Signing in...");

  useEffect(() => {
    // Already signed in — just go to dashboard
    if (isSignedIn) {
      router.push("/dashboard");
      return;
    }

    const token = searchParams.get("token");
    if (!token || !signIn) return;

    signIn
      .create({ strategy: "ticket", ticket: token })
      .then((result) => {
        if (result.status === "complete" && result.createdSessionId) {
          setActive!({ session: result.createdSessionId }).then(() => {
            router.push("/dashboard");
          });
        } else if (result.createdSessionId) {
          setActive!({ session: result.createdSessionId }).then(() => {
            router.push("/dashboard");
          });
        } else {
          setStatus(`Sign-in status: ${result.status ?? "unknown"}`);
        }
      })
      .catch((err) => {
        const clerkErr = err as { errors?: Array<{ code: string; message: string }> };
        const code = clerkErr.errors?.[0]?.code;
        if (code === "session_exists") {
          // Already signed in — redirect
          router.push("/dashboard");
        } else {
          setStatus(`Error: ${clerkErr.errors?.[0]?.message ?? String(err)}`);
        }
      });
  }, [isSignedIn, searchParams, signIn, setActive, router]);

  return <div style={{ padding: 40 }}>{status}</div>;
}

export default function AcceptTokenPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <AcceptTokenInner />
    </Suspense>
  );
}
