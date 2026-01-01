'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface PermissionFormProps {
    initialData?: any;
    teachers?: { id: string; name: string }[];
    onSubmit: (data: any) => Promise<void>;
    onChange?: (data: any) => void;
    submitLabel?: string;
    loading?: boolean;
    showTeacherSelect?: boolean;
    hideSubmitButton?: boolean;
}

const PERIODS = [
    { label: "1교시", start: "08:40", end: "09:30" },
    { label: "2교시", start: "09:40", end: "10:30" },
    { label: "3교시", start: "10:40", end: "11:30" },
    { label: "4교시", start: "11:40", end: "12:30" },
    { label: "점심", start: "12:30", end: "13:30" },
    { label: "5교시", start: "13:30", end: "14:20" },
    { label: "6교시", start: "14:30", end: "15:20" },
    { label: "7교시", start: "15:30", end: "16:20" },
    { label: "종례/청소", start: "16:20", end: "16:40" },
    { label: "8교시", start: "16:40", end: "17:30" },
    { label: "9교시", start: "17:40", end: "18:30" },
    { label: "저녁", start: "18:30", end: "19:30" },
    { label: "야 1", start: "19:30", end: "20:30" },
    { label: "야 2", start: "20:30", end: "21:20" }
];

export function PermissionForm({
    initialData,
    teachers = [],
    onSubmit,
    onChange,
    submitLabel = "신청하기",
    loading = false,
    showTeacherSelect = true,
    hideSubmitButton = false
}: PermissionFormProps) {
    const [formData, setFormData] = useState({
        type: 'MOVEMENT',
        teacherId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '21:00',
        reason: '',
        location: '',
        onCampus: true,
        ...initialData
    });

    // Notify parent of changes
    // Removed useEffect to prevent infinite re-render loop
    const updateFormData = (newData: any) => {
        setFormData(newData);
        if (onChange) onChange(newData);
    };

    const [isTeacherOpen, setIsTeacherOpen] = useState(false);
    const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]); // Indices of selected periods

    const handlePeriodClick = (index: number) => {
        let newSelected = [...selectedPeriods];

        if (newSelected.length === 0) {
            // First selection
            newSelected = [index];
        } else if (newSelected.length === 1) {
            // Second selection (Range)
            const first = newSelected[0];
            const start = Math.min(first, index);
            const end = Math.max(first, index);
            newSelected = [];
            for (let i = start; i <= end; i++) {
                newSelected.push(i);
            }
        } else {
            // Reset and start new selection
            newSelected = [index];
        }

        setSelectedPeriods(newSelected);

        // Update Time
        if (newSelected.length > 0) {
            const startIdx = Math.min(...newSelected);
            const endIdx = Math.max(...newSelected);
            const newData = {
                ...formData,
                startTime: PERIODS[startIdx].start,
                endTime: PERIODS[endIdx].end
            };
            updateFormData(newData);
        }
    };

    const isPeriodSelected = (index: number) => selectedPeriods.includes(index);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <Label htmlFor="on-campus" className="font-medium">교내 활동 여부</Label>
                <div className="flex items-center gap-2">
                    <span className={cn("text-sm", !formData.onCampus ? "font-bold text-gray-900" : "text-gray-500")}>교외</span>
                    <Switch
                        id="on-campus"
                        checked={formData.onCampus}
                        onCheckedChange={(c: boolean) => updateFormData({ ...formData, onCampus: c })}
                        className="data-[state=checked]:bg-green-600"
                    />
                    <span className={cn("text-sm", formData.onCampus ? "font-bold text-green-600" : "text-gray-500")}>교내</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>유형</Label>
                    <Select onValueChange={val => updateFormData({ ...formData, type: val })} defaultValue={formData.type} value={formData.type}>
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
                        onChange={e => updateFormData({ ...formData, location: e.target.value })}
                        placeholder="예: 1-1, OO병원, 자택"
                        required
                    />
                </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-4">
                <Label>시간 선택 (교시)</Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                    {PERIODS.map((p, i) => (
                        <Button
                            key={i}
                            type="button"
                            variant="outline"
                            className={cn(
                                "h-auto py-2 flex flex-col items-center justify-center text-xs gap-1",
                                isPeriodSelected(i)
                                    ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                                    : "hover:bg-gray-100"
                            )}
                            onClick={() => handlePeriodClick(i)}
                        >
                            <span className="font-bold">{p.label}</span>
                            <span className={cn("text-[10px]", isPeriodSelected(i) ? "text-blue-100" : "text-gray-400")}>{p.start}~</span>
                        </Button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 pl-1 break-keep">
                    💡 세밀한 시간 조정이나 날짜가 변경되는 경우, 아래에서 직접 입력해주세요.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label>시작 일시</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input type="date" value={formData.startDate} onChange={e => updateFormData({ ...formData, startDate: e.target.value })} required />
                            <Input type="time" value={formData.startTime} onChange={e => updateFormData({ ...formData, startTime: e.target.value })} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>종료 일시</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input type="date" value={formData.endDate} onChange={e => updateFormData({ ...formData, endDate: e.target.value })} required />
                            <Input type="time" value={formData.endTime} onChange={e => updateFormData({ ...formData, endTime: e.target.value })} required />
                        </div>
                    </div>
                </div>
            </div>

            {showTeacherSelect && (
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
                                                    updateFormData({ ...formData, teacherId: t.id });
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
            )}

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

            {!hideSubmitButton && (
                <div className="pt-2">
                    <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {submitLabel}
                    </Button>
                </div>
            )}
        </form>
    );
}
