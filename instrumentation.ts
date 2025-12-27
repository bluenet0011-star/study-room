export async function register() {
    // Skip backup on Vercel (serverless environment)
    if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.VERCEL) {
        const { scheduleBackup } = await import('./lib/backup');
        scheduleBackup();
    }
}
