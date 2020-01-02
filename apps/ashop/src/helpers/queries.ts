import { pouchService } from '@boatnet/bn-pouch';

export async function allDocs(queryOptions: any, database: string) {
    const db = pouchService.db;
    try {
        const result = await db.allDocs(queryOptions, database);
        for (let i = 0; i < result.rows.length; i++) {
            result.rows[i] = result.rows[i].doc;
        }
        return result.rows;
    } catch (error) {
        console.log(error);
    }
}
