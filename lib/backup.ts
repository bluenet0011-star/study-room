import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export function scheduleBackup() {
    // Skip backup on Vercel (serverless environment)
    if (process.env.VERCEL) {
        console.log("[System] Backup disabled on Vercel");
        return;
    }

    console.log("[System] Initializing Backup Service...");

    const BACKUP_DIR = path.join(process.cwd(), 'backups');

    // Create backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Function to perform backup
    const performBackup = async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.json`);

        try {
            console.log("[System] Starting data export...");

            // Fetch all critical data
            const [users, rooms, seats, assignments, permissions, notices, items, suggestions, events, attendances] = await Promise.all([
                prisma.user.findMany(),
                prisma.room.findMany(),
                prisma.seat.findMany(),
                prisma.seatAssignment.findMany(),
                prisma.permission.findMany(),
                prisma.notice.findMany(),
                prisma.lostItem.findMany(),
                prisma.suggestion.findMany(),
                prisma.event.findMany({ include: { targets: true } }),
                prisma.eventAttendance.findMany()
            ]);

            const dump = {
                timestamp: new Date().toISOString(),
                stats: {
                    users: users.length,
                    rooms: rooms.length,
                    seats: seats.length,
                    assignments: assignments.length,
                    permissions: permissions.length,
                    notices: notices.length,
                    items: items.length,
                    suggestions: suggestions.length,
                    events: events.length,
                    attendances: attendances.length
                },
                data: {
                    users, rooms, seats, assignments, permissions, notices, items, suggestions, events, attendances
                }
            };

            fs.writeFileSync(backupPath, JSON.stringify(dump, null, 2));
            console.log(`[System] Backup Successful: ${backupPath} (Size: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB)`);

            // Cleanup old backups (keep last 5)
            const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.json'));
            if (files.length > 5) {
                files.sort(); // default sort by name (timestamp) works for ISO
                const toDelete = files.slice(0, files.length - 5);
                toDelete.forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
                console.log(`[System] Cleaned up ${toDelete.length} old backups.`);
            }

        } catch (error) {
            console.error("[System] Backup failed:", error);
        }
    };

    // Run backup immediately on startup
    performBackup();

    // Schedule daily backup (24 hours)
    setInterval(performBackup, 24 * 60 * 60 * 1000);
}
