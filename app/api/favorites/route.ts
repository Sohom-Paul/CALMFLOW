import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// POST: Add meditation to favorites
export async function POST(request: Request) {
  try {
    const { userId, meditationId } = await request.json();

    if (!userId || !meditationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("user_favorites")
      .insert([{ user_id: userId, meditation_id: meditationId }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get user's favorite meditations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("user_favorites")
      .select(
        `
        *,
        meditations:meditation_id(id, title, description, duration, instructor, category)
      `
      )
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove meditation from favorites
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const meditationId = searchParams.get("meditationId");

    if (!userId || !meditationId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("meditation_id", meditationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
