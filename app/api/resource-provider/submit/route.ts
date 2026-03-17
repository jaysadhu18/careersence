import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const resource_type = formData.get("resource_type") as string;
        const submitted_by = formData.get("submitted_by") as string;

        // Video
        const videoFile = formData.get("video_file") as File | null;
        let video_file_path = "";

        // Handle Video Upload
        if (videoFile && typeof videoFile === "object") {
            const buffer = Buffer.from(await videoFile.arrayBuffer());
            const fileName = `${Date.now()}-${videoFile.name.replaceAll(" ", "_")}`;
            const uploadDir = path.join(process.cwd(), "public/uploads");

            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }

            await fs.writeFile(path.join(uploadDir, fileName), buffer);
            video_file_path = `/uploads/${fileName}`;
        }

        const duration_seconds = formData.get("duration_seconds") as string;
        const thumbnail_path = formData.get("thumbnail_path") as string;
        const resolution = formData.get("resolution") as string;
        const language = formData.get("language") as string;

        // Article
        const article_content = formData.get("article_content") as string;
        const summary = formData.get("summary") as string;
        const read_time_minutes = formData.get("read_time_minutes") as string;
        const tags = formData.get("tags") as string;

        // Course
        const course_title = formData.get("course_title") as string;
        const course_description = formData.get("course_description") as string;
        const modules = formData.get("modules") as string;
        const total_duration = formData.get("total_duration") as string;
        const level = formData.get("level") as string;
        const certificate_available = formData.get("certificate_available");

        if (!title || !resource_type || !submitted_by) {
            return NextResponse.json({ error: "title, resource_type, and submitted_by are required" }, { status: 400 });
        }

        const validTypes = ["video", "article", "course"];
        if (!validTypes.includes(resource_type)) {
            return NextResponse.json({ error: "Invalid resource_type" }, { status: 400 });
        }

        // Create the resource as pending
        const newResource = await prisma.internalResource.create({
            data: {
                title,
                description: description || "",
                resourceType: resource_type,
                submittedById: submitted_by,
                status: "pending",

                // Video fields
                videoFilePath: video_file_path || null,
                thumbnailPath: thumbnail_path || null,
                durationSeconds: duration_seconds ? parseInt(duration_seconds) : null,
                resolution: resolution || null,
                language: language || null,

                // Article fields
                articleContent: article_content || null,
                summary: summary || null,
                readTimeMinutes: read_time_minutes ? parseInt(read_time_minutes) : null,
                tags: tags ? JSON.stringify(tags) : null,

                // Course fields
                courseTitle: course_title || null,
                courseDescription: course_description || null,
                modules: modules ? JSON.stringify(modules) : null,
                totalDuration: total_duration ? parseInt(total_duration) : null,
                level: level || null,
                certificateAvailable: certificate_available ? Boolean(certificate_available) : false,
            } as any
        });

        return NextResponse.json({
            action: "submit_resource",
            resource: {
                title: newResource.title,
                resource_type: newResource.resourceType,
                status: newResource.status
            }
        });

    } catch (e) {
        return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
    }
}
