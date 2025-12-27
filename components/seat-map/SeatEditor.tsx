'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { createSnapModifier } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { DraggableSeat } from './DraggableSeat';
import { Loader2, Save, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function SeatEditor({ roomId }: { roomId: string }) {
    const router = useRouter();
    const [seats, setSeats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Grid size
    const gridSize = 60;
    const snapToGrid = createSnapModifier(gridSize);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

    useEffect(() => {
        fetch(`/api/admin/rooms/${roomId}/seats`)
            .then(res => res.json())
            .then(data => {
                setSeats(data);
                setLoading(false);
            });
    }, [roomId]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        setSeats((prev: any[]) => prev.map(seat => {
            if (seat.id === active.id) {
                const dx = Math.round(delta.x / gridSize);
                const dy = Math.round(delta.y / gridSize);
                return { ...seat, x: seat.x + dx, y: seat.y + dy };
            }
            return seat;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/rooms/${roomId}/seats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seats })
            });
            if (res.ok) {
                toast.success("배치가 성공적으로 저장되었습니다.");
                // Update seats with new IDs from server if necessary
                const updated = await fetch(`/api/admin/rooms/${roomId}/seats`).then(r => r.json());
                setSeats(updated);
            } else {
                toast.error("저장 중 오류가 발생했습니다.");
            }
        } catch (e) {
            toast.error("서버 연결 오류가 발생했습니다.");
        }
        setSaving(false);
    };

    const addSeat = () => {
        const id = `new-${Date.now()}`;
        setSeats((prev: any[]) => [...prev, { id, x: 0, y: 0, label: `${prev.length + 1}`, isNew: true }]);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/rooms')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> 나가기
                    </Button>
                    <Button size="sm" onClick={addSeat}><Plus className="mr-2 h-4 w-4" /> 좌석 추가</Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        배치 저장
                    </Button>
                </div>
                <span className="text-sm text-gray-500">드래그하여 좌석을 이동할 수 있습니다. 그리드: 60px</span>
            </div>

            <div className="border bg-gray-50 flex-1 relative overflow-auto min-h-[500px] rounded-lg shadow-inner p-4">
                <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    modifiers={[snapToGrid]}
                >
                    {seats.map((seat: any) => (
                        <DraggableSeat key={seat.id} {...seat} />
                    ))}
                </DndContext>
            </div>
        </div>
    );
}
