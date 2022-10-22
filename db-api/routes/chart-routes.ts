import { Router } from "express";
import { Database } from "..";

export class ChartRouter {

    public static async create() {
        const router = Router()
        /*router.get('/testChart', async (_, res) => {
            console.log('Get chart')
            // Preferably we would like it prettier than this
            res.json(
                await (res.locals.db as Database).seriesDb.getChart()
            )
        })*/

        /**
         * List existing chart series
         */
        router.get('/', async (_, res) => {
            console.log('list series')
            res.json(
                await (res.locals.db as Database).seriesDb.listSeries().toArray()
            )
        })

        /**
         * Return an existing chart series
         */
        router.get('/:name', async (req, res) => {
            console.log('list charts')
            res.json(
                await (res.locals.db as Database).seriesDb.getSeriesByName(req.params.name)
            )
        })

        router.delete('/:name', async (req, res) => {
            console.log('delete series')
            res.json(await (res.locals.db as Database).seriesDb.deleteSeries(req.params.name))
        })

        /**
         * Create a new chart series
         */
        router.post('/', async (req, res) => {
            console.log('Create new chart series')
            // Preferably we would like it prettier than this
            res.json(
                await (res.locals.db as Database).seriesDb.newSeries(req.body)
            )
        })

        /**
         * Create a new chart within a series
         */
        router.post('/:name/chart', async (req, res) => {
            console.log('Create new chart')
            // Preferably we would like it prettier than this
            res.json(
                await (res.locals.db as Database).seriesDb.newChart(req.params.name, req.body.params)
            )
        })

        /**
        * Return a chart within a series
        */
        router.get('/:name/chart/:chartName', async (req, res) => {
            console.log('Search new chart', req.params.name, req.params.chartName)
            // Preferably we would like it prettier than this
            res.json(
                await (await (res.locals.db as Database).seriesDb.getChart(req.params.name, req.params.chartName)).toArray()
            )
        })

        /**
         * Given a chart in a series, return the previous set of charts in that series
         */
        router.get('/:series/prev/:chart', async (req, res) => {
            // The best thing we can do here is set a 'start date' and 'end date'
            // and fetch al 
            console.log('Get previous series', req.params.chart)
            res.json(
                (await (await (res.locals.db as Database).seriesDb.getPreviousCharts(req.params.series, req.params.chart)).toArray())
            )
        })

        /**
        * Given a chart in a series, return the previous set of charts in that series
        */
        router.get('/:series/next/:chart', async (req, res) => {
            // The best thing we can do here is set a 'start date' and 'end date'
            // and fetch al 
            console.log('Get next series', req.params.chart)
            res.json(
                await (res.locals.db as Database).seriesDb.getNextChart(req.params.series, req.params.chart)
            )
        })

        /**
        * Given a chart in a series, return the date relating to that chart
        */
        router.get('/:series/date/:chart', async (req, res) => {
            console.log('Get chart date', req.params.chart)
            res.json(
                await (res.locals.db as Database).seriesDb.getChartDate(req.params.series, req.params.chart)
            )
        })


        /**
        * Update the details of a given chart in a series
        */
        router.put('/:series/:chart', async (req, res) => {
            console.log('Update chart', req.params.chart)
            res.json(
                await (res.locals.db as Database).seriesDb.updateChart(req.params.series, req.params.chart, req.body)
            )
        })


        return router;
    }
}