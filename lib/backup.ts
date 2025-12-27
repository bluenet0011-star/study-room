import fs from 'fs';
import path from 'path';

export function scheduleBackup() {
    console.log("[System] Initializing Backup Service...");

    const BACKUP_DIR = path.join(process.cwd(), 'backups');
    const DB_PATH = path.join(process.cwd(), 'prisma/dev.db'); // Adjust if DB path is different

    // Create backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Function to perform backup
    const performBackup = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.db`);

        try {
            if (fs.existsSync(DB_PATH)) {
                fs.copyFileSync(DB_PATH, backupPath);
                console.log(`[System] Database Checkpoint Saved: ${backupPath}`);

                // Optional: Delete old backups (keep last 7 days)
                // cleanupOldBackups(BACKUP_DIR);
            } else {
                console.error("[System] Database file not found for backup.");
            }
        } catch (error) {
            console.error("[System] Backup failed:", error);
        }
    };

    // Run backup immediately on startup (for safety)
    performBackup();

    // Schedule daily backup (Simple SetInterval for 24 hours)
    // 24 * 60 * 60 * 1000 = 86400000 ms
    setInterval(performBackup, 86400000);
}
