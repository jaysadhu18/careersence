import { NextRequest, NextResponse } from "next/server";
import path from "path";
import mammoth from "mammoth";
import { parseResumeWithNER } from "@/lib/resume-ner";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    if (file.type === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const workerPath = "file://" + path.resolve("node_modules/pdfjs-dist/build/pdf.worker.mjs");
      PDFParse.setWorker(workerPath);
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      text = data.text;
      await parser.destroy();
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .txt, .pdf, or .docx file." },
        { status: 400 }
      );
    }

    // Parse with NER
    const structured = await parseResumeWithNER(text);

    return NextResponse.json({ text, structured });
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume: " + error.message },
      { status: 500 }
    );
  }
}
