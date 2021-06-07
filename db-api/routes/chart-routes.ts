import { Router } from "express";
import { Database } from "..";

export class ChartRouter {
    private static getDb(res: Record<string, Record<string, unknown>>): Database {
        return res.locals.db as Database
    }

    public static async create() {
        const router = Router()
        router.get('/', async (_, res) => {
            console.log('we get here')
            // Preferably we would like it prettier than this
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).chartDb.getChart()
            )
        })
        return router;
    }
}