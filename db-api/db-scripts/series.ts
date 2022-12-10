import { AggregationCursor, Cursor, Db, ObjectId } from "mongodb"
import { Song } from "../types/song";
import { updateArtists } from "./common/update-artists";

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'
const CHART_COLLECTION = 'series'

// Probably need to move this into a file common to ui and db-api
export interface ChartParams {
    name: string;
    date: Date;
    songs: Record<string, unknown>[]
}

export class SeriesDb {
    static init(db: Db) {
        return new SeriesDb(db);
    }

    private db: Db

    constructor(db: Db) {
        this.db = db;
        console.log('initialised Series class')
    }

    /*public getChart(): Promise<Record<string, unknown>[]> {
        return this.db.collection(SONG_COLLECTION).find().toArray()
    }*/

    public getChartsInSeries(seriesName: string, page: number) {
        return this.db.collection(CHART_COLLECTION).aggregate([
            { '$match': { name: seriesName } },
            {'$unwind': '$charts'},
            {'$replaceRoot': {'newRoot': '$charts'}},
            {'$sort': {'date': 1}},
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
        const newSongs: Song[] = [];
        const existing = await this.db.collection(CHART_COLLECTION).findOne({ $and: [{ "name": seriesName }, { "charts.name": params.name }] })
        if (existing) {
            throw new Error('Chart names within a series must be unique')
        }

        // Update each required song.
        let position = 1;
        for (const song of params.songs) {
            if (song.id) {
                // Update chart position of song (series + chart)
                await this.db.collection(SONG_COLLECTION).updateOne(
                    { _id: new ObjectId(song.id as ObjectId) },
                    { $push: { [`charts.${seriesName}`]: { chart: params.name, position } } }
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
                // Insert the new song
                const newSong = await this.db.collection(SONG_COLLECTION).insertOne({
                    title,
                    artistIds,
                    artistDisplay,
                    charts: { [seriesName]: [{ chart: params.name, position }] }
                })
                newSongs.push(...newSong.ops)
            }
            position++;
        }
        // Insert the chart
        return this.db.collection(CHART_COLLECTION).updateOne({ name: seriesName },
            {
                $push: {
                    charts: {
                        name: params.name,
                        date: params.date
                    }
                }
            })
    }

    public listSeries(): Cursor<any> {
        return this.db.collection(CHART_COLLECTION).find();
    }

    public async getChart(series: string, chartName: string): Promise<AggregationCursor<unknown>> {
        return this.db.collection(SONG_COLLECTION).aggregate([
            // Find all the songs in this chart
            {
                $match: {
                    [`charts.${series}.chart`]: chartName
                }
            },
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

    public async getPreviousCharts(series: string, chart: string): Promise<AggregationCursor<unknown>> {
        const chartDateArray = await (this.db.collection(CHART_COLLECTION).aggregate([
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { name: chart } },
        ]).toArray())
        const chartDate = chartDateArray[0].date
        console.log('get previous', JSON.stringify(chart));
        const aggregateDb = [
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { date: { $lte: chartDate } } },
            { $sort: { date: -1 } },
        ]
        return this.db.collection(CHART_COLLECTION).aggregate(aggregateDb);
    }

    public async getNextChart(series: string, chart: string): Promise<AggregationCursor<unknown>> {
        const chartDateArray = await (this.db.collection(CHART_COLLECTION).aggregate([
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { name: chart } },
        ]).toArray())
        const chartDate = chartDateArray[0].date
        console.log('get next', JSON.stringify(chart));
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
        await this.db.collection(SONG_COLLECTION).updateMany(
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
        return this.db.collection(CHART_COLLECTION).updateMany(
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