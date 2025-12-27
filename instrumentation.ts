export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { scheduleBackup } = await import('./lib/backup');
        scheduleBackup();
    }
}
