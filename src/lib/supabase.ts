import { createClient } from "@supabase/supabase-js";
import { ChatSession } from "../types";

let supabaseInstance: any = null;

export const supabaseConfig = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || "",
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "",
};

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    return supabaseInstance;
  } catch (e) {
    console.error("Supabase initialization failed:", e);
    return null;
  }
}

export const SUPABASE_SQL_SETUP_GUIDE = `
-- Supabase SQL Editor dastasiga quyidagi kodni yozing:
create table if not exists velox_sessions (
  id text primary key,
  title text not null,
  preset_id text not null,
  search_grounding_enabled boolean not null default false,
  is_archived boolean not null default false,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) ni o'chirish yoki hamma uchun ochiq qilish uchun:
alter table velox_sessions enable row level security;
create policy "Allow public access to sessions" on velox_sessions for all using (true);
`;

export async function fetchSessionsFromSupabase(): Promise<ChatSession[] | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("velox_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error (table might not exist yet):", error);
      throw error;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      presetId: row.preset_id,
      searchGroundingEnabled: row.search_grounding_enabled,
      isArchived: row.is_archived,
      messages: Array.isArray(row.messages)
        ? row.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        : [],
      createdAt: new Date(row.created_at),
    }));
  } catch (e) {
    console.error("Failed to load sessions from Supabase:", e);
    throw e;
  }
}

export async function saveSessionToSupabase(session: ChatSession): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const payload = {
      id: session.id,
      title: session.title,
      preset_id: session.presetId,
      search_grounding_enabled: session.searchGroundingEnabled,
      is_archived: !!session.isArchived,
      messages: session.messages.map(m => ({
        id: m.id,
        role: m.role,
        text: m.text,
        image: m.image || null,
        attachmentName: m.attachmentName || null,
        timestamp: m.timestamp.toISOString(),
      })),
      created_at: session.createdAt.toISOString(),
    };

    const { error } = await client
      .from("velox_sessions")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert error:", error);
      throw error;
    }

    return true;
  } catch (e) {
    console.error("Failed to save session to Supabase:", e);
    throw e;
  }
}

export async function deleteSessionFromSupabase(id: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from("velox_sessions")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Supabase delete error:", error);
      throw error;
    }

    return true;
  } catch (e) {
    console.error("Failed to delete session from Supabase:", e);
    throw e;
  }
}
