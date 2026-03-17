"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function ResourceProviderPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>("");

    // Auth Form State
    const [isLogin, setIsLogin] = useState(false); // Default to register
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("individual");
    const [organizationName, setOrganizationName] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    // Submission Form State
    const [resourceType, setResourceType] = useState("video");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitResult, setSubmitResult] = useState<any>(null);

    // Video specific
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [durationSeconds, setDurationSeconds] = useState("");

    // Article specific
    const [articleContent, setArticleContent] = useState("");
    const [readTimeMinutes, setReadTimeMinutes] = useState("");

    // Course specific
    const [courseTitle, setCourseTitle] = useState("");
    const [level, setLevel] = useState("Beginner");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            const payload = {
                email,
                password,
                name,
                role,
                organization_name: organizationName
            };
            const res = await fetch("/api/resource-provider/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setUserId(data.user_id);
                setUserRole(data.role);
            } else {
                setAuthError(data.error || "Authentication failed");
            }
        } catch (e) {
            setAuthError("Server error");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSubmitResource = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitResult(null);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("resource_type", resourceType);
            formData.append("submitted_by", userId || "");

            if (resourceType === "video") {
                if (videoFile) formData.append("video_file", videoFile);
                formData.append("duration_seconds", durationSeconds);
            } else if (resourceType === "article") {
                formData.append("article_content", articleContent);
                formData.append("read_time_minutes", readTimeMinutes);
            } else if (resourceType === "course") {
                formData.append("course_title", courseTitle);
                formData.append("level", level);
            }

            const res = await fetch("/api/resource-provider/submit", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitResult(data);
                // Reset basic fields
                setTitle("");
                setDescription("");
                setVideoFile(null);
                setArticleContent("");
                setCourseTitle("");
            } else {
                console.error("Submit error", data);
                alert("Failed to submit resource: " + data.error);
            }
        } catch (e) {
            alert("Server error");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (!userId) {
        return (
            <PageShell title="Resource Provider Portal" description="Register or login to contribute learning materials.">
                <Card padding="lg" className="max-w-md mx-auto">
                    <CardHeader title={isLogin ? "Login" : "Register as Provider"} />
                    <form onSubmit={handleAuth} className="space-y-4 mt-4">
                        {!isLogin && (
                            <>
                                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
                                <Select
                                    label="Provider Role"
                                    options={[
                                        { value: "individual", label: "Individual" },
                                        { value: "institute", label: "Institute" },
                                        { value: "university", label: "University" },
                                    ]}
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                />
                                {(role === "institute" || role === "university") && (
                                    <Input label="Organization Name" value={organizationName} onChange={e => setOrganizationName(e.target.value)} />
                                )}
                            </>
                        )}
                        <Input label="Email Address" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                        <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />

                        {authError && <p className="text-sm text-red-500">{authError}</p>}

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full flex h-[44px] items-center justify-center rounded-lg bg-[var(--color-primary-600)] font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:opacity-60"
                        >
                            {authLoading ? "Authenticating..." : (isLogin ? "Login" : "Register")}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[var(--color-primary-600)] hover:underline">
                                {isLogin ? "Register here" : "Login here"}
                            </button>
                        </p>
                    </form>
                </Card>
            </PageShell>
        );
    }

    return (
        <PageShell title={`Provider Dashboard (${userRole})`} description="Submit new learning resources for verification.">
            <Card padding="lg">
                <CardHeader title="Submit Internal Resource" description="Upload a video, article, or course directly to the platform." />

                {submitResult && (
                    <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200">
                        <p className="font-semibold text-green-700">Resource submitted successfully!</p>
                        <p className="text-sm text-green-600">Your {submitResult.resource.resource_type} "{submitResult.resource.title}" has been sent for admin verification (Status: <strong>{submitResult.resource.status}</strong>).</p>
                    </div>
                )}

                <form onSubmit={handleSubmitResource} className="space-y-6 mt-4">
                    <Select
                        label="Resource Type"
                        options={[
                            { value: "video", label: "Video" },
                            { value: "article", label: "Article" },
                            { value: "course", label: "Course" },
                        ]}
                        value={resourceType}
                        onChange={e => setResourceType(e.target.value)}
                    />

                    <Input label="Resource Title" required value={title} onChange={e => setTitle(e.target.value)} />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text)]">Description</label>
                        <textarea
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] outline-none min-h-[100px]"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="rounded-xl border border-[var(--color-border)] p-4 bg-gray-50 dark:bg-white/5 space-y-4">
                        <h4 className="font-medium text-[var(--color-text)] mb-2 capitalize">{resourceType} Details</h4>

                        {resourceType === "video" && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--color-text)]">Video File Upload</label>
                                    <input
                                        type="file"
                                        accept="video/mp4,video/x-m4v,video/*,audio/*"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary-50)] file:text-[var(--color-primary-700)] hover:file:bg-[var(--color-primary-100)]"
                                        onChange={e => setVideoFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <Input label="Duration (Seconds)" type="number" value={durationSeconds} onChange={e => setDurationSeconds(e.target.value)} />
                            </>
                        )}

                        {resourceType === "article" && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--color-text)]">Article Content (Markdown/HTML)</label>
                                    <textarea
                                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] outline-none min-h-[200px]"
                                        value={articleContent}
                                        onChange={e => setArticleContent(e.target.value)}
                                    />
                                </div>
                                <Input label="Estimated Read Time (Minutes)" type="number" value={readTimeMinutes} onChange={e => setReadTimeMinutes(e.target.value)} />
                            </>
                        )}

                        {resourceType === "course" && (
                            <>
                                <Input label="Course Title" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
                                <Select
                                    label="Level"
                                    options={[
                                        { value: "Beginner", label: "Beginner" },
                                        { value: "Intermediate", label: "Intermediate" },
                                        { value: "Advanced", label: "Advanced" },
                                    ]}
                                    value={level}
                                    onChange={e => setLevel(e.target.value)}
                                />
                                <p className="text-xs text-gray-400 mt-2">Modules configuration can be managed after initial course submission.</p>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full flex h-[44px] items-center justify-center rounded-lg bg-[var(--color-primary-600)] font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:opacity-60"
                    >
                        {submitLoading ? "Submitting..." : `Submit ${resourceType} for Verification`}
                    </button>
                </form>
            </Card>
        </PageShell>
    );
}
