import CreateRoom from "@/components/lobby/createroom";
import RoomList from "@/components/lobby/RoomList";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center gap-10">
      <CreateRoom />
      <RoomList />
    </main>
  );
}