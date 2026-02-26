"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const roleOptions = [
  { value: "", label: "Select your role" },
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

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  interests: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data: ProfileData) => {
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setRole(data.role || "");
          try {
            const parsed = JSON.parse(data.interests || "[]");
            setInterests(new Set(Array.isArray(parsed) ? parsed : []));
          } catch {
            setInterests(new Set());
          }
          if (data.createdAt) {
            setMemberSince(
              new Date(data.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            );
          }
        })
        .catch(() => setError("Failed to load profile"))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

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
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          role,
          interests: Array.from(interests),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <PageShell title="My Profile" maxWidth="md">
        <Card padding="lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="My Profile" description="Manage your account details and preferences." maxWidth="md">
      <Card padding="lg">
        {/* Avatar & member info */}
        <div className="mb-6 flex items-center gap-4 border-b border-[var(--color-border)] pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-2xl font-bold text-[var(--color-primary-700)]">
            {name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {name || "User"}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">{email}</p>
            {memberSince && (
              <p className="text-xs text-[var(--color-text-muted)]">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>

        {success && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800" role="alert">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-[var(--color-error)] bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            disabled
            onChange={() => {}}
          />
          <p className="!mt-1 text-xs text-[var(--color-text-muted)]">
            Email cannot be changed.
          </p>

          <Input
            label="Phone"
            type="tel"
            placeholder="+1 234 567 8901"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Select
            label="Role"
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interestTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    interests.has(tag)
                      ? "border-[var(--color-primary-600)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
