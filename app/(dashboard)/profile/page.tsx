'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            if (res.ok) {
                toast.success("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
                setTimeout(() => {
                    // Force logout or redirect
                    window.location.href = "/api/auth/signout";
                }, 2000);
            } else {
                const msg = await res.text();
                toast.error(msg || "비밀번호 변경에 실패했습니다.");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">내 정보 설정</h1>

            <Card>
                <CardHeader>
                    <CardTitle>비밀번호 변경</CardTitle>
                    <CardDescription>
                        계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">현재 비밀번호</label>
                            <Input
                                type="password"
                                required
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">새 비밀번호</label>
                                <Input
                                    type="password"
                                    required
                                    minLength={4}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">새 비밀번호 확인</label>
                                <Input
                                    type="password"
                                    required
                                    minLength={4}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                비밀번호 변경
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
