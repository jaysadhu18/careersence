"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card } from "@/components/ui/Card";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Please enter a valid email";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setFormError("Invalid email or password. Please try again.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="hidden flex-col justify-center lg:flex">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Welcome back
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Sign in to access your career dashboard, AI roadmap, and personalized
            learning resources.
          </p>
          <div className="mt-8 flex h-48 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <span className="text-sm font-medium">Illustration placeholder</span>
          </div>
        </div>

        <Card padding="lg" className="mx-auto w-full max-w-md">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Enter your credentials to continue.
          </p>

          {formError && (
            <div
              className="mt-4 rounded-lg border border-[var(--color-error)] bg-red-50 p-3 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <Link
                href="/"
                className="text-sm font-medium text-[var(--color-primary-600)] hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="mt-4"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--color-primary-600)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-[var(--color-text-muted)]">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
