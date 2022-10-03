import { Router } from "express";
import { Database } from "..";

export class ChartRouter {
    private static getDb(res: Record<string, Record<string, unknown>>): Database {
        return res.locals.db as Database
    }

    public static async create() {
        const router = Router()
        /*router.get('/testChart', async (_, res) => {
            console.log('Get chart')
            // Preferably we would like it prettier than this
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.getChart()
            )
        })*/

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

        router.delete('/:name', async (req, res) => {
            console.log('delete series')
            res.json(await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.deleteSeries(req.params.name))
        })

        /**
         * Create a new chart series
         */
        router.post('/', async (req, res) => {
            console.log('Create new chart series')
            // Preferably we would like it prettier than this
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.newSeries(req.body)
            )
        })

        /**
         * Create a new chart within a series
         */
        router.post('/:name/chart', async (req, res) => {
            console.log('Create new chart')
            // Preferably we would like it prettier than this
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.newChart(req.params.name, req.body.params)
            )
        })

        /**
        * Return a chart within a series
        */
        router.get('/:name/chart/:chartName', async (req, res) => {
            console.log('Search new chart', req.params.name, req.params.chartName)
            // Preferably we would like it prettier than this
            res.json(
                await (await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.getChart(req.params.name, req.params.chartName)).toArray()
            )
        })

        /**
         * Given a chart in a series, return the previous set of charts in that series
         */
        router.get('/:series/prev/:chart', async (req, res) => {
            // The best thing we can do here is set a 'start date' and 'end date'
            // and fetch al 
            console.log('Get previous series', req.params.chart, JSON.stringify(new Date(req.params.chart)))
            res.json(
                (await (await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.getPreviousCharts(req.params.series, req.params.chart)).toArray())
            )
        })

        /**
        * Given a chart in a series, return the previous set of charts in that series
        */
        router.get('/:series/next/:chart', async (req, res) => {
            // The best thing we can do here is set a 'start date' and 'end date'
            // and fetch al 
            console.log('Get next series', req.params.chart, JSON.stringify(new Date(req.params.chart)))
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).seriesDb.getNextChart(req.params.series, req.params.chart)
            )
        })
        return router;
    }
}