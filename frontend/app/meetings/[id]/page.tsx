import { MeetingDetailClient } from "@/components/MeetingDetailClient";
export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MeetingDetailClient id={Number(id)} />;
}
