import { Db, ObjectId } from "mongodb";
import { updateArtists } from "./common/update-artists";
import { getSongChartPipeline } from "./common/add-chart-dates";
import { SongQueryParams } from "../types/query-params";
import { Song } from "../types/song";
import { escapeRegex } from "./common/excape-regex";
import { splitChartRun } from "./common/chart-run"
import { Artist } from "../types/artist";
import { formatSong } from "./common/format-song";

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'
const CHART_COLLECTION = 'series'
const DROPOUT = -1

export class SongDb {

    private db: Db;

    static init(db: Db) {
        return new SongDb(db);
    }

    constructor(db: Db) {
        this.db = db;
        console.log('initialised Song class')
    }

    public async getSong(songId: string, seriesName?: string): Promise<Song> {
        // If series name is not defined, find the first series the song has appeared in
        if (!seriesName) {
          seriesName = Object.keys(
            (await this.db.collection(SONG_COLLECTION).findOne({ '_id': new ObjectId(songId) }))?.charts
          )[0]
        }
        const songArray = await this.db.collection(SONG_COLLECTION).aggregate<Song>([
            {"$match": { '_id': new ObjectId(songId) }}, 
            ...getSongChartPipeline(seriesName),
        ]).toArray();
        const song = songArray[0]
        song.artists = await this.db.collection(ARTIST_COLLECTION).find<Artist>({ _id: {$in: song.artistIds as unknown as ObjectId[] } }).toArray();
        song.chartRuns = splitChartRun(song.charts ? song.charts[seriesName] : [])
        formatSong(song, seriesName)
        return song
    }

    private getMatchPipeline(params: SongQueryParams): Record<string, unknown> {
        const regex_title = escapeRegex(params.title || '')
        const regex_artist = escapeRegex(params.artist || '')
        return {"$match": {"$and": [
            ...[params.title ? {"title": {"$regex": new RegExp(regex_title), "$options": 'i'}} : {}],
            ...[params.artist ?  {"artistDisplay": {"$regex": new RegExp(regex_artist), "$options": 'i'}} : {}]
        ]}}
    }

    public async getSongs(params: SongQueryParams): Promise<unknown> {
        const song = await this.db.collection(SONG_COLLECTION)
            .aggregate([
                ...params.sortBy ? [{ "$sort": { [params.sortBy]: 1 } }] : [],
                this.getMatchPipeline(params),
                ...params.pageNumber ? [{ "$skip": parseInt(params.pageNumber) * 20 }] : [],
                ...params.limit ? [{ "$limit": parseInt(params.limit) }] : [],
            ]);
        return song.toArray()
    }

    public async getSongCount(params: SongQueryParams): Promise<number> {
        const count_object = await this.db.collection(SONG_COLLECTION).aggregate([
            this.getMatchPipeline(params),
            {'$count': 'song_count'}
        ]).toArray();
        return count_object[0].song_count
    }

    public async findSong(details: string) {
        console.log('find song', details)
        const indexOfFirstHyphen = details.indexOf(' - ')
        const artistDisplay = details.slice(0, indexOfFirstHyphen).trim();
        const title = details.slice(indexOfFirstHyphen + 3).trim();
        return this.db.collection(SONG_COLLECTION).findOne({ $and: [{ artistDisplay }, { title }] })
    }

    public async updateSong(id: string, newData: Record<string, unknown>) {
        if (newData.artists) {
            let artistIds: ObjectId[] = []
            for (const artist of newData.artists as string[]) {
                artistIds.push(await updateArtists(this.db.collection(ARTIST_COLLECTION), artist))
            }
            newData.artistIds = artistIds;
            delete newData.artists
        }
        return this.db.collection(SONG_COLLECTION).updateOne({ '_id': new ObjectId(id) }, { '$set': newData })
    }

    public async mergeSongs(fromId: string, toId: string) {
        console.log('merging', fromId, toId)
        if (fromId === toId) {
            throw new Error('both fromId and toId point to the same song')
        }
        const from = await this.db.collection(SONG_COLLECTION).findOne({'_id': new ObjectId(fromId)})
        const to = await this.db.collection(SONG_COLLECTION).findOne({'_id': new ObjectId(toId)})
        if (!from || !to) {
            throw new Error('Both fromId and toId need to be correctly defined')
        }
        // Merge chart runs
        for (let series of Object.keys(from.charts)) {
            if (!to.charts[series]) {
                to.charts[series] = from.charts[series]
            } else {
                for (const chart1 of from.charts[series]) {
                    const duplicateChart = (to.charts[series] as Record<string, string | number>[]).find(
                        chartObject => chartObject.chart == chart1.chart
                    )
                    if (duplicateChart) {
                        if (duplicateChart.position == DROPOUT) {
                            const indexOfDuplicateChart = to.charts[series].indexOf(duplicateChart)
                            to.charts[series][indexOfDuplicateChart] = chart1
                        }
                        else if (chart1.position != DROPOUT) {
                            throw new Error('Cannot merge as both songs appear at different positions in the same chart')
                        }
                    } else {
                        to.charts[series].push(chart1)
                    }
                }
            }
        }
        await this.db.collection(SONG_COLLECTION).updateOne({ '_id': new ObjectId(toId) }, {'$set': to})
        return this.db.collection(SONG_COLLECTION).deleteOne({ '_id': new ObjectId(fromId) })
    }

    public async getLeaderboard(options: Record<string, string>): Promise<Song[]> {
        const lastChart = await this.db.collection(CHART_COLLECTION).aggregate([
            {'$match': {name: options.series}},
            {'$unwind': '$charts'},
            {'$match': {'charts.date': {'$lte': new Date(options.to).toISOString()}}},
            {'$sort': {'charts.date': -1}},
            {'$limit': 1}
        ]).toArray()
        const lastChartName = lastChart[0].charts.name
        const leaderboard = await this.db.collection(SONG_COLLECTION).aggregate<Song>([
            ...getSongChartPipeline(options.series),
            {'$match': {[`charts.${options.series}.date`]: {'$gte': new Date(options.from).toISOString(), '$lte': new Date(options.to).toISOString()}}},
            {'$addFields': {totalPoints: {'$reduce': {
                input: `$charts.${options.series}`,
                initialValue: 0,
                in: {'$add': 
                    ['$$value', 
                    {'$cond': [
                        {$eq: [
                            '$$this.position',
                            DROPOUT
                        ]},
                        0,
                        {'$subtract': 
                            [101, 
                            options.includeFullChartRun === 'true'
                                ? '$$this.position' 
                                : {'$cond': [
                                    {'$and': [
                                        {'$gte': ['$$this.date', new Date(options.from).toISOString()]}, 
                                        {'$lte': ['$$this.date', new Date(options.to).toISOString()]},
                                        {'$ne': ['$$this.position', DROPOUT]},
                                    ]},
                                    '$$this.position',
                                    101
                                ]}
                            ]
                        }
                    ]}]
                }
            }}}},
            // Add extra points if required
            ...options.estimateFuturePoints === 'true' ? [
            {'$addFields': {lastChart: {'$filter': {
                input: `$charts.${options.series}`,
                as: "chart",
                cond: { '$eq': [ "$$chart.chart", lastChartName ] }
            }}}},
            {'$addFields': {lastChartObject: {'$arrayElemAt': ['$lastChart', 0]}}},
            {'$set': {'totalPoints': {
                '$cond': [
                    {'$and': [
                        {'$eq': [{'$size': '$lastChart'}, 1]},
                        {'$ne': ['$lastChartObject.position', DROPOUT]}
                    ]}, 
                    {'$add': ['$totalPoints', {'$floor': {'$pow': [2, {'$divide': [1050, {'$add': [100, '$lastChartObject.position']}]}]}}]}, 
                    '$totalPoints'
                ]
            }}},
            {'$project': {lastChart: 0, lastChartObject: 0}}] : [],
            {'$sort': {'totalPoints': -1}},
            {'$limit': parseInt(options.numberOfResults)}
        ]).toArray()
        for (const song of leaderboard) {
            song.chartRuns = splitChartRun(song.charts ? song.charts[options.series] : [])
        }
        return leaderboard
    }
}