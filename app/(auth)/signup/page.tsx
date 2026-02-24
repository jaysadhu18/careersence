"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "recent_graduate", label: "Recent graduate" },
  { value: "career_switcher", label: "Career switcher" },
  { value: "other", label: "Other" },
];

const interestTags = [
  "Tech",
  "Business",
  "Healthcare",
  "Design",
  "Data",
  "Marketing",
  "Education",
  "Engineering",
];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Please enter a valid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 8)
      next.password = "Password must be at least 8 characters";
    if (!role) next.role = "Please select your role";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFormError("");
    setLoading(true);
    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: role || undefined,
          interests: Array.from(interests),
        }),
      });
      const data = await signupRes.json();

      if (!signupRes.ok) {
        setFormError(data.error || "Sign up failed. Please try again.");
        return;
      }

      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setFormError("Account created. Please sign in.");
        router.push("/signin");
        return;
      }
      router.push("/dashboard");
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
            Start your career journey
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Create an account to get personalized roadmaps, quiz results, and
            learning recommendations powered by AI.
          </p>
          <div className="mt-8 flex h-48 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-secondary-50)] text-[var(--color-secondary-700)]">
            <span className="text-sm font-medium">Onboarding illustration</span>
          </div>
        </div>

        <Card padding="lg" className="mx-auto w-full max-w-md">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            We&apos;ll use this to personalize your experience.
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
              label="Name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <Select
              label="I am a"
              placeholder="Select your role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              error={errors.role}
            />

            <div>
              <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
                Interests (optional)
              </p>
              <p className="mb-2 text-xs text-[var(--color-text-muted)]">
                We&apos;ll tailor recommendations to these areas.
              </p>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      interests.has(tag)
                        ? "bg-[var(--color-primary-600)] text-white"
                        : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-300)]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="mt-6"
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-[var(--color-primary-600)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
