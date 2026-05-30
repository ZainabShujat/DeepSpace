import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, username } = body || {};

    if (!roomId || !username) return NextResponse.json({ error: 'missing' }, { status: 400 });

    // validate roomId looks like a UUID to avoid DB errors from bad inputs
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(roomId)) return NextResponse.json({ error: 'invalid_room_id' }, { status: 400 });

    const { data: member } = await supabase
      .from('room_members')
      .select('id, username, seat_id')
      .eq('room_id', roomId)
      .eq('username', username)
      .maybeSingle();

    const { data: members } = await supabase
      .from('room_members')
      .select('id, username, created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    const nextHost = (members ?? []).find((row) => row.username !== username) || null;

    if (member) {
      await supabase.from('activity_log').insert([
        {
          room_id: roomId,
          user_id: null,
          action: 'leave',
          details: { username: member.username, seat: member.seat_id || null },
        },
      ]);
    }

    if (nextHost) {
      await supabase
        .from('rooms')
        .update({ owner_username: nextHost.username })
        .eq('id', roomId);

      await supabase.from('activity_log').insert([
        {
          room_id: roomId,
          user_id: null,
          action: 'host_transfer',
          details: { from: username, to: nextHost.username },
        },
      ]);
    }

    await supabase.from('room_members').delete().eq('room_id', roomId).eq('username', username);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
