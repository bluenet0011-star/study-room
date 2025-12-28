'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { createSnapModifier } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { DraggableSeat } from './DraggableSeat';
import { Loader2, Save, Plus, ArrowLeft, ZoomIn, ZoomOut, MousePointer2, Box, Square, DoorOpen, Maximize } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SeatEditor({ roomId }: { roomId: string }) {
    const router = useRouter();
    const [seats, setSeats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scale, setScale] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [copyBuffer, setCopyBuffer] = useState<any[]>([]);

    // Label Editing State
    const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');

    // Grid size
    const gridSize = 30; // Reduced to 30px
    const snapToGrid = createSnapModifier(gridSize);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 }
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
        const dx = Math.round(delta.x / gridSize);
        const dy = Math.round(delta.y / gridSize);

        if (dx === 0 && dy === 0) return;

        setSeats((prev: any[]) => {
            const movingIds = selectedIds.includes(active.id as string)
                ? selectedIds
                : [active.id as string];

            // Calculate potential new positions
            const newSeats = prev.map(seat => {
                if (movingIds.includes(seat.id)) {
                    return { ...seat, x: seat.x + dx, y: seat.y + dy };
                }
                return seat;
            });

            // Collision Detection
            const movingSeats = newSeats.filter(s => movingIds.includes(s.id));
            const staticSeats = newSeats.filter(s => !movingIds.includes(s.id));

            for (const moving of movingSeats) {
                // Check if overlapping with any static seat
                const isOverlap = staticSeats.some(staticS =>
                    staticS.x === moving.x && staticS.y === moving.y
                );
                // Also check negative coordinates
                if (isOverlap || moving.x < 0 || moving.y < 0) {
                    // toast.warning("충돌 또는 벗어남 감지");
                    return prev; // Revert
                }
            }

            return newSeats;
        });
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
                // Update seats to get real IDs if needed, but not strictly required if optimistically updated
            } else {
                toast.error("저장 중 오류가 발생했습니다.");
            }
        } catch (e) {
            toast.error("서버 연결 오류가 발생했습니다.");
        }
        setSaving(false);
    };

    const getNextLabel = (currentSeats: any[]) => {
        const numbers = currentSeats
            .map(s => parseInt(s.label))
            .filter(n => !isNaN(n));
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;
        return (max + 1).toString();
    };

    const addNode = (type: string = 'SEAT') => {
        const id = `new-${Date.now()}`;
        let label = '';
        if (type === 'SEAT') {
            label = getNextLabel(seats);
        } else if (type === 'SEAT') {
            // Fallback or other logic if needed, but keeping it simple as per request
            label = `${seats.filter(s => s.type !== 'WINDOW' && s.type !== 'DOOR' && s.type !== 'WALL').length + 1}`;
        }

        // Find first empty spot
        // Simple heuristic: 0,0 then scan
        // For now just 0,0
        setSeats(prev => [...prev, {
            id,
            x: 0,
            y: 0,
            label,
            type,
            rotation: 0,
            isNew: true
        }]);
    };

    const handleSeatClick = (id: string, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            setSelectedIds([id]);
        }
    };

    const handleDoubleClick = (seat: any) => {
        if (seat.type === 'SEAT') {
            setEditingSeatId(seat.id);
            setEditLabel(seat.label);
        }
    };

    const saveLabel = () => {
        if (!editingSeatId) return;
        setSeats(prev => prev.map(s => s.id === editingSeatId ? { ...s, label: editLabel } : s));
        setEditingSeatId(null);
    };

    const handleBackgroundClick = () => {
        setSelectedIds([]);
    };

    const deleteSelected = () => {
        setSeats(prev => prev.filter(s => !selectedIds.includes(s.id)));
        setSelectedIds([]);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.length > 0 && !editingSeatId) deleteSelected();
            }

            // Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !editingSeatId) {
                if (selectedIds.length > 0) {
                    const selectedSeats = seats.filter(s => selectedIds.includes(s.id));
                    setCopyBuffer(selectedSeats);
                    toast.info(`${selectedSeats.length}개 복사됨`);
                }
            }

            // Paste (Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !editingSeatId) {
                if (copyBuffer.length > 0) {
                    const offset = 1;

                    setSeats(prev => {
                        let nextLabelNum = parseInt(getNextLabel(prev));

                        const newSeats = copyBuffer.map((s, idx) => {
                            const newId = `copy-${Date.now()}-${idx}`;
                            let newLabel = s.label;

                            // Auto-increment label on paste if it represents a number
                            if (s.type === 'SEAT') {
                                newLabel = (nextLabelNum++).toString();
                            }

                            return {
                                ...s,
                                id: newId,
                                x: s.x + offset,
                                y: s.y + offset,
                                label: newLabel,
                                isNew: true
                            };
                        });

                        setTimeout(() => setSelectedIds(newSeats.map(s => s.id)), 0);

                        return [...prev, ...newSeats];
                    });
                    toast.success("붙여넣기 완료");
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, seats, copyBuffer, editingSeatId]);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm border">
                <div className="flex gap-2 items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/rooms')}><ArrowLeft className="h-4 w-4" /></Button>
                    <div className="h-6 w-px bg-gray-200 mx-2" />

                    <Button variant="outline" size="sm" onClick={() => addNode('SEAT')}><Square className="mr-2 h-4 w-4" />좌석</Button>
                    <Button variant="outline" size="sm" onClick={() => addNode('WINDOW')}><Box className="mr-2 h-4 w-4" />창문</Button>
                    <Button variant="outline" size="sm" onClick={() => addNode('DOOR')}><DoorOpen className="mr-2 h-4 w-4" />문</Button>
                    <Button variant="outline" size="sm" onClick={() => addNode('WALL')}><Maximize className="mr-2 h-4 w-4" />벽</Button>

                    <div className="h-6 w-px bg-gray-200 mx-2" />
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.2, s - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                    <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={deleteSelected}>삭제 ({selectedIds.length})</Button>
                    )}
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        저장
                    </Button>
                </div>
            </div>

            <div className="border bg-gray-50 flex-1 relative overflow-hidden rounded-lg shadow-inner" onClick={handleBackgroundClick}>
                <div
                    className="absolute inset-0 transition-transform origin-top-left"
                    style={{
                        transform: `scale(${scale})`,
                        width: '10000px', // Large canvas area
                        height: '10000px',
                        backgroundImage: 'radial-gradient(circle, #ddd 2px, transparent 2px)',
                        backgroundSize: `${gridSize}px ${gridSize}px`
                    }}
                >
                    <DndContext
                        sensors={sensors}
                        onDragEnd={handleDragEnd}
                        onDragStart={(e) => {
                            if (!selectedIds.includes(e.active.id as string)) {
                                if (!e.active.data.current?.nativeEvent?.ctrlKey) { // This might not pass through easily
                                    setSelectedIds([e.active.id as string]);
                                }
                            }
                        }}
                        modifiers={[snapToGrid]}
                    >
                        {seats.map((seat: any) => (
                            <div
                                key={seat.id}
                                onClick={(e) => { e.stopPropagation(); handleSeatClick(seat.id, e); }}
                                className="absolute" // Wrapper for click handling if Draggable consumes it?
                            // Actually better to handle selection inside draggable or overlay?
                            // dnd-kit draggable consumes mouse events.
                            >
                                <DraggableSeat
                                    {...seat}
                                    isSelected={selectedIds.includes(seat.id)}
                                    onDoubleClick={() => handleDoubleClick(seat)}
                                />
                            </div>
                        ))}
                    </DndContext>
                </div>
            </div>

            <div className="text-xs text-gray-400 text-right">
                Ctrl+C/V 복붙 (자동 번호) | 더블클릭 번호수정 | Ctrl+Click 다중 선택 | Delete 삭제
            </div>

            <Dialog open={!!editingSeatId} onOpenChange={(open) => !open && setEditingSeatId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>좌석 번호 수정</DialogTitle>
                        <DialogDescription>
                            좌석에 표시될 번호나 텍스트를 입력하세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="label" className="text-left">
                                라벨
                            </Label>
                            <Input
                                id="label"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') saveLabel(); }}
                                className="col-span-3"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={saveLabel}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
