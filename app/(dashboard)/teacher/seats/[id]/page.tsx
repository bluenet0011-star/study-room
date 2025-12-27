import TeacherSeatMap from '@/components/seat-map/TeacherSeatMap';

export default async function SeatRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <TeacherSeatMap roomId={id} />
        </div>
    );
}
