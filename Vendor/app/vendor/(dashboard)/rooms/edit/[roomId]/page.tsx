"use client";

import { RoomForm } from "@/components/rooms/RoomForm";
import { useParams } from "next/navigation";

export default function EditRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  
  return <RoomForm roomId={roomId} />;
}
