import { AggregationCursor, Db, FindCursor, ObjectId } from "mongodb"
import { Song } from "../types/song";
import { updateArtists } from "./common/update-artists";
import { Chart } from "../types/chart";
import { getTop40ChartRun, splitChartRun } from "./common/chart-run";
import { formatSong } from "./common/format-song";

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'
const CHART_COLLECTION = 'series'

const DROPOUT = -1

// Probably need to move this into a file common to ui and db-api
export interface ChartParams {
    name: string;
    date: Date;
    songs: Record<string, unknown>[]
}

export class ChartDb {
    static init(db: Db) {
        return new ChartDb(db);
    }

    private db: Db

    constructor(db: Db) {
        this.db = db;
        console.log('initialised Chart class')
    }

    /*public getChart(): Promise<Record<string, unknown>[]> {
        return this.db.collection(SONG_COLLECTION).find().toArray()
    }*/

    public getChartsInSeries(seriesName: string, params: Record<string, string>) {
        const page = parseInt(params.page)
        const order = parseInt(params.order)
        return this.db.collection(CHART_COLLECTION).aggregate([
            { '$match': { name: seriesName } },
            {'$unwind': '$charts'},
            {'$replaceRoot': {'newRoot': '$charts'}},
            {'$sort': {'date': order}},
            {'$skip': page * 20},
            {'$limit': 20}
        ]).toArray()
    }

    public newSeries(params: Record<string, unknown>): Promise<unknown> {
        console.log('insert new series', params?.name)
        return this.db.collection(CHART_COLLECTION).insertOne({
            name: params?.name,
            charts: [],
        })
    }

    public async newChart(seriesName: string, params: ChartParams): Promise<unknown> {
        if (!params.name) {
            throw new Error('Chart name has not been specified')
        }
        const existing = await this.db.collection(CHART_COLLECTION).findOne({ $and: [{ "name": seriesName }, { "charts.name": params.name }] })
        if (existing) {
            throw new Error('Chart names within a series must be unique')
        }
        const nextChart = await this.getNextChartByDate(seriesName, params.date)
        // Update each required song.
        let position = 1;
        for (const song of params.songs) {
            const newChartPositions = [{ chart: params.name, position }]
            if (song.id) {
                // Update chart position of song (series + chart)
                // If the song isn't in the following chart, mark it as a 'dropout' in that chart
                if (nextChart) {
                    const songObject = await this.db.collection(SONG_COLLECTION).findOne({_id: new ObjectId(song.id as ObjectId)})
                    const nextChartInSong = songObject?.charts[seriesName].find(
                        (chart: Record<string, string>) => chart.chart === nextChart
                    )
                    if (nextChartInSong.length === 0) {
                        newChartPositions.push({chart: nextChart, position: DROPOUT})
                    }
                }
                await this.db.collection<Song>(SONG_COLLECTION).updateOne(
                    { _id: new ObjectId(song.id as ObjectId) },
                    { $push: { [`charts.${seriesName}`]: {$each: newChartPositions }} }
                )
            }
            else {
                const artists = song.artists;
                const artistDisplay = song.artistDisplay
                const title = song.title;
                // Determine list of artist Ids involved with song (creating new artists if necessary)
                const artistIds = []
                for (const artist of artists as string[]) {
                    artistIds.push(await updateArtists(this.db.collection(ARTIST_COLLECTION), artist))
                }
                if (nextChart) {
                    newChartPositions.push({chart: nextChart, position: DROPOUT})
                }
                // Insert the new song
                const newSong = await this.db.collection(SONG_COLLECTION).insertOne({
                    title,
                    artistIds,
                    artistDisplay,
                    charts: { [seriesName]: newChartPositions }
                })
                song.id = newSong.insertedId
            }
            position++;
        }
        // Find dropouts from the last chart and mark them as such
        const songIds = params.songs.map(song => new ObjectId(song.id as ObjectId))
        const previousCharts = await (await this.getPreviousChartsByDate(seriesName, params.date)).toArray()
        const previousChart = previousCharts[0]
        if (previousChart) {
            await this.db.collection<Song>(SONG_COLLECTION).updateMany(
                {
                    $and: [{
                        [`charts.${seriesName}`]: {$elemMatch:
                            {
                                chart: previousChart.name,
                                position: {$ne: DROPOUT}
                            }
                        }
                    },
                    {
                        _id: {$nin: songIds}
                    }
                    ]
                },
                { $push: { [`charts.${seriesName}`]: {chart: params.name, position: DROPOUT} } }
            )
        }
        // Insert the chart
        return this.db.collection<Chart>(CHART_COLLECTION).updateOne({ name: seriesName },
            {
                $push: {
                    charts: {
                        name: params.name,
                        date: params.date
                    }
                }
            })
    }

    public listSeries(): FindCursor<any> {
        return this.db.collection(CHART_COLLECTION).find();
    }

    public getRecentCharts(): AggregationCursor<Chart[]> {
        return this.db.collection(CHART_COLLECTION).aggregate([
            {'$unwind': '$charts'},
            {'$sort': {'charts.date': -1}},
            {'$limit': 5},
            {'$project': {
                'series': '$name',
                'name': '$charts.name',
            }}
        ])
    }

    /**
     * Get a pipeline to limit past charts if a specific chart size is chosen
     */
    private getSizePipeline(series: string, size?: string): Record<string, unknown>[] {
        if (!size) {
            return []
        }
        return [{
            $addFields: {
                charts: {
                    [`${series}`]: {
                        $filter: {
                            input: `$charts.${series}`,
                            as: 'chart',
                            cond: { $lte: [`$$chart.position`, parseInt(size)] }
                        }   
                    }
                }
            }
        }]
    }

    public async getChart(series: string, chartName: string, size?: string) {
        const songs = await (await this.getChartSongs(series, chartName, size)).toArray()
        const previousCharts = await (await this.getPreviousCharts(series, chartName)).toArray()
        const nextChart = await this.getNextChart(series, chartName)

        const prevChartNames = previousCharts.map(chart => chart.name);
        const songsWithStats = songs.map((song: Song) => {
            // Index '1' is correct here as '0' will be the current chart
            if (!song.charts) {
                throw new Error(`Song ${song.title} has no charts!`);
            }
            const currentSeries = song.charts[series]
            const charts = currentSeries.filter(
                chart => prevChartNames.includes(chart.chart) && chart.position != DROPOUT
            );
            const lastChartRecord = charts.find(chart => chart.chart === prevChartNames[1])
            charts.sort((a, b) => a.position - b.position);
            return {
              ...song,
              lastWeek: lastChartRecord?.position,
              weeksOn: charts.length,
              peak: charts[0].position,
            }
          });

        return {
            lastChart: previousCharts[1].name,
            nextChart,
            songs: songsWithStats,
        }
    }

    public async getChartSongs(series: string, chartName: string, size?: string): Promise<AggregationCursor<Song>> {
        return this.db.collection(SONG_COLLECTION).aggregate([
            // Find all the songs in this chart
            {
                $match: {
                    [`charts.${series}`]: {
                        $elemMatch:
                        {
                            chart: chartName,
                            position: {
                                $ne: DROPOUT,
                                ...(size ? { $lte: parseInt(size) } : {})
                            }
                        }
                    }
                }
            },
            ...this.getSizePipeline(series, size),
            // Remove all chart info for the songs besides the specified chart
            {
                $addFields: {
                    chartInfo: {
                        $filter: {
                            input: `$charts.${series}`,
                            as: 'chart',
                            cond: { $eq: [`$$chart.chart`, chartName] }
                        }
                    },
                }
            },
            { $unwind: '$chartInfo' },
            { $addFields: { position: '$chartInfo.position' } },
            { $project: { chartInfo: 0 } },
            { $sort: { 'position': 1 } }
        ])
    }

    public async getPreviousCharts(series: string, chart: string): Promise<AggregationCursor<Chart>> {
        const chartDateArray = await (this.db.collection(CHART_COLLECTION).aggregate([
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { name: chart } },
        ]).toArray())
        const chartDate = chartDateArray[0].date
        console.log('get previous', JSON.stringify(chart));
        return this.getPreviousChartsByDate(series, chartDate)
    }

    public async getPreviousChartsByDate(series: string, chartDate: Date): Promise<AggregationCursor<Chart>> {
        const aggregateDb = [
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { date: { $lte: chartDate } } },
            { $sort: { date: -1 } },
        ]
        return this.db.collection(CHART_COLLECTION).aggregate(aggregateDb);
    }

    public async getNextChart(series: string, chart: string): Promise<string> {
        const currentChart = await (this.db.collection(CHART_COLLECTION).aggregate([
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { name: chart } },
        ]).toArray())
        const chartDate = currentChart[0].date
        console.log('get next', JSON.stringify(chart));
        return this.getNextChartByDate(series, chartDate)
    }

    public async getNextChartByDate(series: string, chartDate: Date): Promise<string> {
        const aggregateDb = [
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { date: { $gt: chartDate } } },
            { $sort: { date: 1 } },
            { $limit: 1 },
        ]
        const chartArray = await this.db.collection(CHART_COLLECTION).aggregate(aggregateDb).toArray();
        return chartArray[0]?.name
    }

    private getSymbol(weeksOn: number, thisWeek: number, lastWeek?: number) {
        if (!lastWeek || lastWeek > 40) {
            if (weeksOn == 1) {
                return ':ne:'
            }
            return ':re:'
        } else if (thisWeek > lastWeek) {
            return ':down:'
        } else if (thisWeek < lastWeek) {
            return ':up:'
        } else {
            return ':right:'
        }
    }

    public async getFormattedChartString(series: string, chartName: string, size?: string): Promise<Record<string, string>> {
        const songs = await (await this.getChartSongs(series, chartName, size)).toArray()
        const previousCharts = await (await this.getPreviousCharts(series, chartName)).toArray()

        let formattedChartString = ""
        for (let i = 0; i < songs.length; i++) {
            if (i == 40) {
                formattedChartString += `[b]Below 40:[/b][size=1]\n\n`
            }
            const song = songs[i]
            if (!song.charts) {
                throw new Error(`Song ${song.title} has no charts!`);
            }
            const currentSeries = song.charts[series]
            const chartPositions = []
            for (const chartPosition of currentSeries) {
                const chart = previousCharts.find(chart => chart.name == chartPosition.chart)
                if (chart) {
                    chartPosition.date = chart.date.toString()
                    chartPositions.push(chartPosition)
                }
            }
            song.chartRuns = splitChartRun(chartPositions)
            chartPositions.filter(
                chart => chart.position != DROPOUT
            );
            const lastChartRecord = chartPositions.find(chart => chart.chart === previousCharts[1].name)
            song.lastWeek = lastChartRecord?.position
            song.weeksOn = chartPositions.length
            const weeksOnTop40 = chartPositions.filter(chart => chart.position <= 40).length
            chartPositions.sort((a, b) => a.position - b.position);
            song.peak = chartPositions[0].position
            const lastWeekString = `${song.lastWeek || (song.weeksOn > 1 ? 'RE' : 'NE')}`
            let positionString = `[b]${i + 1}[/b] [${lastWeekString}]`
            if (i >= 40 && lastWeekString == 'NE') {
                positionString = `[color=#FF0000]${positionString}[/color]`
            }
            let songString = `${positionString} ${song.artistDisplay} - ${song.title}`
            if (i < 40) {
                const symbol = this.getSymbol(weeksOnTop40, i + 1, song.lastWeek)
                const chartRun = getTop40ChartRun(song.chartRuns)
                songString = `${symbol} ${songString} ${chartRun}`
                if ((i + 1) % 10 == 0) {
                    songString += `\n`
                }
            } else {
                songString += ` (Pk: ${song.peak})`
            }
            formattedChartString += `${songString}\n`
        }
        if (songs.length > 40) {
            formattedChartString += `[/size]`
        }
        return {'chartString': formattedChartString}
    }

    public async deleteSeries(seriesName: string) {
        // First delete any song info about the series
        console.log("Deleting chart info")
        await this.db.collection(SONG_COLLECTION).updateMany(
            {},
            { $unset: { [`charts.${seriesName}`]: "" } }
        )
        console.log("Deleting song info")
        // Then delete any songs which relied only on this series
        await this.db.collection(SONG_COLLECTION).deleteMany({ $or: [{ charts: {} }, { charts: { $exists: false } }] })
        // TODO: Also delete artists which don't have any songs
        // Then delete the series itself
        console.log("Deleting series")
        return this.db.collection(CHART_COLLECTION).deleteOne({ "name": seriesName })
    }

    public async deleteChart(seriesName: string, chartName: string) {
        // First delete any song info about the series
        console.log("Deleting chart info")
        await this.db.collection<Song>(SONG_COLLECTION).updateMany(
            {},
            { '$pull': { [`charts.${seriesName}`]: {chart: chartName} }}
        )
        // Then delete any song series which only contained this chart
        console.log('Deleting series info')
        await this.db.collection(SONG_COLLECTION).updateMany(
            {[`charts.${seriesName}`]: {'$size': 0}},
            { '$unset': { [`charts.${seriesName}`]: "" } }
        )
        // Then delete any songs which relied only on this series
        console.log("Deleting song info")
        await this.db.collection(SONG_COLLECTION).deleteMany({ $or: [{ charts: {} }, { charts: { $exists: false } }] })
        // TODO: Also delete artists which don't have any songs
        // Then delete the chart itself
        console.log("Deleting chart")
        return this.db.collection<Chart>(CHART_COLLECTION).updateMany(
            { "name": seriesName }, 
            { '$pull': { 'charts': { 'name': chartName}  }}
        )
    }


    public async getChartDate(seriesName: string, chartName: string): Promise<string> {
        const result = await this.db.collection(CHART_COLLECTION).aggregate(
            [
                {
                    '$match': {
                        'name': seriesName
                    }
                }, {
                    '$unwind': {
                        'path': '$charts'
                    }
                }, {
                    '$replaceRoot': {
                        'newRoot': '$charts'
                    }
                }, {
                    '$match': {
                        'name': chartName
                    }
                }
            ]
        ).toArray()
        return result[0].date
    }

    public async updateChart(seriesName: string, chartName: string, newChartData: Record<string, unknown>): Promise<unknown> {
        console.log('updating', seriesName, chartName, newChartData)
        // First, update the chart
        await this.db.collection(CHART_COLLECTION).updateOne({ name: seriesName, 'charts.name': chartName }, { '$set': { 'charts.$': newChartData } })
        // Next, update the songs containing that chart
        await this.db.collection(SONG_COLLECTION).updateMany(
            { [`charts.${seriesName}.chart`]: chartName },
            { '$set': { [`charts.${seriesName}.$.chart`]: newChartData.name } }
        )
        return;
    }
}