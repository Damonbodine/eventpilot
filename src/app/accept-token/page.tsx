"use client";

import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function AcceptTokenInner() {
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
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

    signIn
      .create({ strategy: "ticket", ticket: token })
      .then((result) => {
        if (result.createdSessionId) {
          setActive({ session: result.createdSessionId }).then(() => {
            router.push("/dashboard");
          });
        } else {
          setMsg("Sign-in status: " + (result.status ?? "unknown"));
        }
      })
      .catch((err) => {
        const clerkErr = err as { errors?: Array<{ code: string; message: string }> };
        if (clerkErr.errors?.[0]?.code === "session_exists") {
          router.push("/dashboard");
        } else {
          setMsg("Error: " + (clerkErr.errors?.[0]?.message ?? String(err)));
        }
      });
  }, [isSignedIn, searchParams, signIn, setActive, router]);

  return <div style={{ padding: 40 }}>{msg}</div>;
}

export default function AcceptTokenPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <AcceptTokenInner />
    </Suspense>
  );
}
