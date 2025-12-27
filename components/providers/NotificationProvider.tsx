'use client';
import { useEffect } from 'react';
import { useSocket } from './SocketProvider';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    const socket = useSocket();
    const { data: session } = useSession();

    useEffect(() => {
        if (!socket || !session?.user) return;

        // Listen for permission updates
        const handlePermissionUpdate = (data: any) => {
            // Only notify if it's the student's permission or if the teacher is assigned
            if (session.user.role === 'STUDENT' && data.studentId === session.user.id) {
                toast(`퍼미션 상태 변경: ${data.status}`, {
                    description: `귀하의 퍼미션 신청이 ${data.status === 'APPROVED' ? '승인' : '반려'}되었습니다.`,
                });
            } else if (session.user.role === 'TEACHER' && data.teacherId === session.user.id) {
                // For teachers, notify of new requests or updates if they are involved
                toast(`퍼미션 업데이트: ${data.studentName}`, {
                    description: `${data.studentName} 학생의 퍼미션 상태가 변경되었습니다.`,
                });
            }
        };

        const handleNewPermission = (data: any) => {
            if (session.user.role === 'TEACHER' && data.teacherId === session.user.id) {
                toast(`새 퍼미션 신청: ${data.studentName}`, {
                    description: `${data.type} 신청이 들어왔습니다. 확인해 주세요.`,
                });
            }
        };

        socket.on('PERMISSION_UPDATE', handlePermissionUpdate);
        socket.on('NEW_PERMISSION', handleNewPermission);

        return () => {
            socket.off('PERMISSION_UPDATE', handlePermissionUpdate);
            socket.off('NEW_PERMISSION', handleNewPermission);
        };
    }, [socket, session]);

    return <>{children}</>;
}
