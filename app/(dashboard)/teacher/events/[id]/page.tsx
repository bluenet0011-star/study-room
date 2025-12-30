'use client';

import { useState, useRef, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, ScanLine, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Attendee {
    id: string; // EventAttendance ID
    student: {
        id: string;
        name: string;
        grade: number;
        class: number;
        number: number;
        loginId: string;
    };
    scannedAt: string;
}

interface Target {
    id: string;
    studentId: string; // The loginId or identifier stored in target
    name: string;
}

export default function EventScanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [scanInput, setScanInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Data State
    const [eventTitle, setEventTitle] = useState('');
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [targets, setTargets] = useState<Target[]>([]);
    const [loading, setLoading] = useState(true);

    // Scanner state
    const scannerRef = useRef<any>(null);
    const [isScannerRunning, setIsScannerRunning] = useState(false);
    const [useFrontCamera, setUseFrontCamera] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        fetchEventData();

        // Focus input
        inputRef.current?.focus();

        // Initialize Scanner
        // @ts-ignore
        if (typeof Html5Qrcode !== 'undefined' && !scannerRef.current) {
            // @ts-ignore
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText: string) => {
                    handleScanInput(decodedText);
                },
                (errorMessage: any) => { }
            ).then(() => {
                setIsScannerRunning(true);
            }).catch((err: any) => {
                console.error("Error starting scanner", err);
            });
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch((err: any) => console.error(err));
            }
        };
    }, [id]);

    const fetchEventData = async () => {
        try {
            const res = await fetch(`/api/teacher/events/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEventTitle(data.title);
                setTargets(data.targets);
                setAttendees(data.attendances);
            }
        } catch (e) {
            console.error(e);
            toast.error("데이터 로딩 실패");
        } finally {
            setLoading(false);
        }
    };

    const toggleCamera = () => {
        if (!scannerRef.current || !isScannerRunning) return;

        const nextUseFront = !useFrontCamera;
        setUseFrontCamera(nextUseFront);

        scannerRef.current.stop().then(() => {
            const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
            const cameraConfig = nextUseFront ? { facingMode: "user" } : { facingMode: "environment" };

            return scannerRef.current.start(
                cameraConfig,
                config,
                (decodedText: string) => handleScanInput(decodedText),
                (err: any) => { }
            );
        }).then(() => {
            setIsScannerRunning(true);
        }).catch((err: any) => {
            console.error("Failed to toggle camera", err);
            toast.error("카메라 전환 실패");
        });
    };

    const handleScanInput = async (text: string) => {
        // Prevent duplicate fast scans
        // But scanning same person multiple times might update "scannedAt" if we allow.
        // Let's rely on API response or simple frontend check.

        let studentId = text;
        try {
            const data = JSON.parse(text);
            studentId = data.id || data.studentId || text;
        } catch { }

        try {
            const res = await fetch(`/api/teacher/events/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: studentId })
            });

            if (res.ok) {
                const newAttendance = await res.json();
                toast.success(`${newAttendance.student.name} 출석 완료!`);

                // Update local state
                setAttendees(prev => {
                    // Replace if exists (update time), else add
                    const filtered = prev.filter(a => a.student.id !== newAttendance.student.id);
                    return [newAttendance, ...filtered];
                });
            } else {
                const msg = await res.text();
                toast.error(`출석 실패: ${msg}`);
            }
        } catch (e) {
            toast.error("서버 오류");
        }
    };

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanInput) return;
        handleScanInput(scanInput);
        setScanInput('');
        inputRef.current?.focus();
    };

    // Derived Lists
    const attendedStudentIds = new Set(attendees.map(a => a.student.loginId)); // Using loginId to match targets?
    // Wait, targets store 'studentId' which we decided is likely loginId.
    // Attendees have 'student' object with 'id' (UUID) and 'loginId'.
    // We should compare using loginId if that's what's in Target.

    // Targets who have attended
    const nonAttendedTargets = targets.filter(t => !attendedStudentIds.has(t.studentId));

    // Attendees who were NOT in targets (Unexpected)
    const targetStudentIds = new Set(targets.map(t => t.studentId));
    const unexpectedAttendees = attendees.filter(a => !targetStudentIds.has(a.student.loginId));

    // Regular attendees (In target and attended)
    const regularAttendees = attendees.filter(a => targetStudentIds.has(a.student.loginId));

    return (
        <div className="p-4 md:p-6 h-[calc(100vh-60px)] flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/teacher/events">
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        {eventTitle}
                        <Badge variant="outline" className="ml-2">실시간</Badge>
                    </h1>
                    <div className="text-sm text-gray-500 flex gap-4">
                        <span className="text-blue-600 font-bold">출석 {attendees.length}명</span>
                        <span className="text-red-500 font-bold">미출석 {nonAttendedTargets.length}명</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                {/* Input Area */}
                <Card className="flex flex-col justify-center items-center p-4 md:p-8 border-2 border-primary/20 bg-blue-50/30 overflow-hidden shrink-0">

                    <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg bg-black">
                        <div id="reader" className="w-[250px] h-[250px] md:w-[300px] md:h-[300px]"></div>
                        {isScannerRunning && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="absolute bottom-2 right-2 z-10 opacity-90 text-xs h-8"
                                onClick={toggleCamera}
                            >
                                <ScanLine className="w-3 h-3 mr-1" />
                                {useFrontCamera ? "후면 전환" : "전면 전환"}
                            </Button>
                        )}
                    </div>

                    {!scanInput && !isScannerRunning && <div className="bg-white p-4 rounded-full mb-6 shadow-sm">
                        <ScanLine className="w-12 h-12 text-blue-500" />
                    </div>}

                    <form onSubmit={handleScan} className="w-full max-w-sm space-y-4">
                        <Input
                            ref={inputRef}
                            value={scanInput}
                            onChange={e => setScanInput(e.target.value)}
                            placeholder="QR 스캔 또는 학번 입력..."
                            className="text-center text-lg h-12"
                            autoComplete="off"
                        />
                        <p className="text-center text-xs text-gray-400">
                            카메라가 자동으로 실행됩니다.
                        </p>
                    </form>
                </Card>

                {/* List Area */}
                <Card className="flex flex-col h-full overflow-hidden bg-white shadow-sm border">
                    <Tabs defaultValue="non-attended" className="w-full h-full flex flex-col">
                        <div className="p-3 border-b bg-gray-50">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="non-attended" className="relative">
                                    미출석
                                    <Badge variant="secondary" className="ml-2 h-5 text-[10px] min-w-[20px]">{nonAttendedTargets.length}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value="attended">
                                    출석
                                    <Badge variant="secondary" className="ml-2 h-5 text-[10px] min-w-[20px]">{regularAttendees.length}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value="unexpected">
                                    외부인
                                    {unexpectedAttendees.length > 0 && <Badge variant="destructive" className="ml-2 h-5 text-[10px] min-w-[20px]">{unexpectedAttendees.length}</Badge>}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-auto bg-white p-0">
                            <TabsContent value="non-attended" className="m-0 h-full overflow-auto p-4 space-y-2">
                                {nonAttendedTargets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <Check className="w-10 h-10 mb-2 text-green-500 opacity-50" />
                                        <p>모든 대상 학생이 출석했습니다!</p>
                                    </div>
                                ) : (
                                    nonAttendedTargets.map((t, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-red-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                                    미
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{t.name}</p>
                                                    <p className="text-xs text-gray-500">{t.studentId}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-red-500 border-red-200 bg-white">미출석</Badge>
                                        </div>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="attended" className="m-0 h-full overflow-auto p-4 space-y-2">
                                {regularAttendees.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <p>아직 출석한 학생이 없습니다.</p>
                                    </div>
                                ) : (
                                    regularAttendees.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition-colors animate-in slide-in-from-top-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    출
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{a.student.name}</p>
                                                    <p className="text-xs text-gray-500">{a.student.grade}-{a.student.class}-{a.student.number}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-white mb-1">출석</Badge>
                                                <p className="text-[10px] text-gray-400">{new Date(a.scannedAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="unexpected" className="m-0 h-full overflow-auto p-4 space-y-2">
                                {unexpectedAttendees.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <p>명단 외 참석자가 없습니다.</p>
                                    </div>
                                ) : (
                                    unexpectedAttendees.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50/50 rounded-lg animate-in slide-in-from-top-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                    ?
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{a.student.name}</p>
                                                    <p className="text-xs text-gray-500">{a.student.grade}-{a.student.class}-{a.student.number}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 mb-1">외부인</Badge>
                                                <p className="text-[10px] text-gray-400">{new Date(a.scannedAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
