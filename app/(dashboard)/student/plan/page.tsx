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

            <Card className="border-t-4 border-t-blue-500 shadow-md">
                <CardHeader className="bg-gray-50/50 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        퍼미션 신청서 작성
                    </CardTitle>
                    <CardDescription>
                        교내 이동, 외출, 조퇴 등 필요한 퍼미션을 신청하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                            <Label htmlFor="on-campus" className="font-medium">교내 활동 여부</Label>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm", !formData.onCampus ? "font-bold text-gray-900" : "text-gray-500")}>교외</span>
                                <Switch
                                    id="on-campus"
                                    checked={formData.onCampus}
                                    onCheckedChange={(c: boolean) => setFormData({ ...formData, onCampus: c })}
                                    className="data-[state=checked]:bg-green-600"
                                />
                                <span className={cn("text-sm", formData.onCampus ? "font-bold text-green-600" : "text-gray-500")}>교내</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>유형</Label>
                                <Select onValueChange={val => setFormData({ ...formData, type: val })} defaultValue={formData.type}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MOVEMENT">이동 (교내)</SelectItem>
                                        <SelectItem value="OUTING">외출</SelectItem>
                                        <SelectItem value="EARLY_LEAVE">조퇴</SelectItem>
                                        <SelectItem value="OTHER">기타</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>장소명</Label>
                                <Input
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="예: 1-1, OO병원, 자택"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>시작 일시</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
                                    <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>종료 일시</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required />
                                    <Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>담당 선생님</Label>
                            <Popover open={isTeacherOpen} onOpenChange={setIsTeacherOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isTeacherOpen}
                                        className="w-full justify-between bg-yellow-50/50 border-yellow-200"
                                    >
                                        {formData.teacherId
                                            ? teachers.find((t) => t.id === formData.teacherId)?.name
                                            : "선생님을 검색하세요 (필수)"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="선생님 이름 검색..." />
                                        <CommandList>
                                            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                                            <CommandGroup>
                                                {teachers.map((t) => (
                                                    <CommandItem
                                                        key={t.id}
                                                        value={t.name}
                                                        onSelect={() => {
                                                            setFormData({ ...formData, teacherId: t.id });
                                                            setIsTeacherOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.teacherId === t.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {t.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>사유</Label>
                            <Textarea
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="구체적인 사유를 입력하세요."
                                className="min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                신청하기
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
