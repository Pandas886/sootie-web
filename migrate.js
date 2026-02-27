import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// 优先从环境变量加载 DATABASE_URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("请在 .env 文件中设置 DATABASE_URL 或提供该环境变量。");
    process.exit(1);
}

const sql = postgres(connectionString, {
    max: 1,
    ssl: 'require'
});

async function main() {
    try {
        const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260225073156_init_im_schema.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration...');
        await sql.unsafe(migrationSql);

        console.log('Migration completed successfully!');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await sql.end();
    }
}

main();
