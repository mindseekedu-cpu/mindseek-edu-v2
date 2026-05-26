import { NextRequest, NextResponse } from "next/server";
import { Question } from "@/types";
import { STATIC_QUESTION } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kelas, topik, bahasa } = body;

    if (!kelas || !topik || !bahasa) {
      return NextResponse.json(
        { error: "Parameter kelas, topik, dan bahasa wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedTopik = topik.trim().toLowerCase();

    if (normalizedTopik !== "penjumlahan") {
      return NextResponse.json(
        {
          error: `Topik "${topik}" belum tersedia. Saat ini hanya tersedia topik: Penjumlahan.`,
        },
        { status: 422 }
      );
    }

    const question: Question = {
      ...STATIC_QUESTION,
      meta: {
        kelas: String(kelas),
        topik: String(topik),
        bahasa: String(bahasa),
      },
    };

    return NextResponse.json(
      { question, success: true },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "MindSeek Practice API – gunakan metode POST." },
    { status: 405 }
  );
}