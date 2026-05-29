export interface Member {
  id: string;
  username: string;
  status: string;
  avatar: string;
  seat_id?: string | null;
}

export default Member;
