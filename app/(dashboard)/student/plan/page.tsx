'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch'; // Ensure you have this component or use standard checkbox
import { Loader2, Calendar, ChevronsUpDown, Check } from 'lucide-react';

import { useSession } from 'next-auth/react';
import { Checkbox } from '@/components/ui/checkbox'; // Fallback if switch unavailable
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PermissionForm } from '@/components/forms/PermissionForm';

interface Teacher {
    id: string;
    name: string;
}

export default function StudyPlanPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [isTeacherOpen, setIsTeacherOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'MOVEMENT',
        teacherId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '21:00',
        reason: '',
        location: '',
        onCampus: true
    });

    useEffect(() => {
        fetch('/api/users/teachers').then(res => res.json()).then(setTeachers);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.teacherId) {
            toast.error("담당 선생님을 선택해주세요.");
            return;
        }

        setLoading(true);
        try {
            const startStr = `${formData.startDate}T${formData.startTime}`;
            const endStr = `${formData.endDate}T${formData.endTime}`;

            const res = await fetch('/api/student/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: formData.type,
                    teacherId: formData.teacherId,
                    start: new Date(startStr).toISOString(),
                    end: new Date(endStr).toISOString(),
                    reason: formData.reason,
                    location: formData.location
                })
            });

            if (res.ok) {
                const data = await res.json();

                toast.success("학습계획이 신청되었습니다.");
                router.push('/student/status');
            } else {
                toast.error("신청에 실패했습니다. 입력값을 확인해주세요.");
            }
        } catch (e) {
            console.error("Submission error", e);
            toast.error("오류가 발생했습니다.");
        }
        setLoading(false);
    };

    return (
        <div className="p-6 w-full max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">퍼미션 신청 / 이동 신청</h1>
                <p className="text-muted-foreground mt-1">자습 시간 중 이동이나 퍼미션을 신청합니다.</p>
            </div>

            <Card className="border-t-4 border-t-primary shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                    <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                        <Calendar className="w-5 h-5 text-primary" />
                        퍼미션 신청서 작성
                    </CardTitle>
                    <CardDescription>
                        교내 이동, 외출, 조퇴 등 필요한 퍼미션을 신청하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <PermissionForm
                        teachers={teachers}
                        onSubmit={async (data) => {
                            setFormData(data); // Sync for logic
                            // Adapter for handleSubmit logic
                            if (!data.teacherId) {
                                toast.error("담당 선생님을 선택해주세요.");
                                return;
                            }
                            setLoading(true);
                            try {
                                const startStr = `${data.startDate}T${data.startTime}`;
                                const endStr = `${data.endDate}T${data.endTime}`;
                                const res = await fetch('/api/student/permissions', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        type: data.type,
                                        teacherId: data.teacherId,
                                        start: new Date(startStr).toISOString(),
                                        end: new Date(endStr).toISOString(),
                                        reason: data.reason,
                                        location: data.location
                                    })
                                });
                                if (res.ok) {
                                    toast.success("학습계획이 신청되었습니다.");
                                    router.push('/student/status');
                                } else {
                                    toast.error("신청에 실패했습니다.");
                                }
                            } catch (e) {
                                toast.error("오류가 발생했습니다.");
                            }
                            setLoading(false);
                        }}
                        loading={loading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
