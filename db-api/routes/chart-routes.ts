import { Router } from "express";
import { Database } from "..";

export class ChartRouter {
    private static getDb(res: Record<string, Record<string, unknown>>): Database {
        return res.locals.db as Database
    }

    public static async create() {
        const router = Router()
        router.get('/testChart', async (_, res) => {
            console.log('Get chart')
            // Preferably we would like it prettier than this
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.getChart()
            )
        })

        /**
         * List existing chart series
         */
        router.get('/', async (_, res) => {
            console.log('list series')
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.listSeries().toArray()
            )
        })

        /**
         * Return an existing chart series
         */
        router.get('/:name', async (req, res) => {
            console.log('list charts')
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.getSeriesByName(req.params.name)
            )
        })

        /**
         * Create a new chart series
         */
        router.post('/', async (req, res) => {
            console.log('Create new chart series', req.body)
            // Preferably we would like it prettier than this
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.newSeries(req.body)
            )
        })

        /**
         * Create a new chart within a series
         */
        router.post('/:name/chart', async (req, res) => {
            console.log('Create new chart', req.params.name, req.body)
            // Preferably we would like it prettier than this
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.newChart(req.params.name, req.body.params)
            )
        })
        return router;
    }
}