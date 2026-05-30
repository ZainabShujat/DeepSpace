export interface Member {
  id: string;
  username: string;
  status: string;
  avatar: string;
  seat_id?: string | null;
  approval_status?: string | null;
  focus_task?: string | null;
  last_seen_at?: string | null;
}

export default Member;
