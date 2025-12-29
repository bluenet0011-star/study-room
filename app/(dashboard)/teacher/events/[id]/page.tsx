'use client';

import { useState, useRef, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EventScanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [scanInput, setScanInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [attendees, setAttendees] = useState<any[]>([]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();

        // Initialize Scanner if library exists
        // @ts-ignore
        if (typeof Html5QrcodeScanner !== 'undefined') {
            // @ts-ignore
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    // iOS Safari requires these settings
                    rememberLastUsedCamera: true,
                    aspectRatio: 1.0,
                    // Use environment camera (back camera) by default
                    videoConstraints: {
                        facingMode: { ideal: "environment" }
                    }
                },
                /* verbose= */ true // Enable verbose for debugging iOS issues
            );

            scanner.render((decodedText: string) => {
                handleScanInput(decodedText);
                // Optional: Pause scanning briefly?
                toast.success("스캔 성공!");
            }, (error: any) => {
                // handle scan error (ignore frequent errors)
            });

            return () => {
                scanner.clear().catch((error: any) => console.error("Failed to clear scanner. ", error));
            };
        }
    }, []);

    const handleScanInput = (text: string) => {
        try {
            const data = JSON.parse(text);
            addAttendee(data.name, data.id);
        } catch {
            addAttendee(`학번 ${text}`, text);
        }
    };

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanInput) return;
        handleScanInput(scanInput);
        setScanInput('');
        toast.success('출석 확인되었습니다.');
    };

    const addAttendee = (name: string, studentId: string) => {
        setAttendees(prev => [{
            id: Date.now(),
            name,
            studentId,
            time: new Date().toLocaleTimeString()
        }, ...prev]);
    };

    return (
        <div className="p-6 h-[calc(100vh-60px)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/teacher/events">
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">출석 스캔 모드</h1>
                    <p className="text-gray-500 text-sm">QR 코드를 스캔하거나 학번을 입력하세요.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Input Area */}
                <Card className="flex flex-col justify-center items-center p-8 border-2 border-primary/20 bg-blue-50/30 overflow-hidden">
                    <div id="reader" className="w-[300px] h-[300px] mb-6 bg-gray-100 rounded-lg overflow-hidden"></div>

                    {!scanInput && <div className="bg-white p-4 rounded-full mb-6 shadow-sm">
                        <ScanLine className="w-12 h-12 text-blue-500" />
                    </div>}
                    <form onSubmit={handleScan} className="w-full max-w-sm space-y-4">
                        <Input
                            ref={inputRef}
                            value={scanInput}
                            onChange={e => setScanInput(e.target.value)}
                            placeholder="QR 스캔 대기 중..."
                            className="text-center text-lg h-12"
                            autoComplete="off"
                        />
                        <p className="text-center text-xs text-gray-400">
                            스캐너를 사용하거나 학번 입력 후 엔터를 누르세요.
                        </p>
                    </form>
                </Card>

                {/* List Area */}
                <Card className="flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-semibold flex justify-between">
                        <span>출석 명단 ({attendees.length}명)</span>
                        <Button variant="ghost" size="sm" onClick={() => setAttendees([])}>초기화</Button>
                    </div>
                    <div className="flex-1 overflow-auto p-2 space-y-2">
                        {attendees.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-white animate-in slide-in-from-top-2">
                                <span className="font-bold">{user.name}</span>
                                <span className="text-sm text-gray-500">{user.time}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
