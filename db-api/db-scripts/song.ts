import { Db, ObjectId } from "mongodb";
import { Song } from "../types/song";
import { updateArtists } from "./common/update-artists";
import { getSongChartPipeline } from "./common/add-chart-dates";
import { SongQueryParams } from "../types/query-params";

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'

export class SongDb {

    private db: Db;

    static init(db: Db) {
        return new SongDb(db);
    }

    constructor(db: Db) {
        this.db = db;
        console.log('initialised Song class')
    }

    // TODO: We need to be able to create a pipeline to add dates to charts
    // We ought to have this somewhere common as I think a lot of pages will need it
    public async getSong(songId: string, seriesName?: string): Promise<unknown> {
        // If series name is not defined, find the first series the song has appeared in
        if (!seriesName) {
          seriesName = Object.keys(
            (await this.db.collection(SONG_COLLECTION).findOne({ '_id': new ObjectId(songId) })).charts
          )[0]
        }
        const song = await this.db.collection(SONG_COLLECTION).aggregate([
            {"$match": { '_id': new ObjectId(songId) }}, 
            ...getSongChartPipeline(seriesName),
        ]).toArray();
        song[0].artists = await this.db.collection(ARTIST_COLLECTION).find({ _id: { $in: song[0].artistIds } }).toArray();
        return song[0]
    }

    public async getSongs(params: SongQueryParams): Promise<unknown> {
        const song = await this.db.collection(SONG_COLLECTION)
            .aggregate([
                ...params.sortBy ? [{ "$sort": { [params.sortBy]: 1 } }] : [],
                {"$match": {"$and": [
                    ...[params.title ? {"title": {"$regex": new RegExp(params.title), "$options": 'i'}} : {}],
                    ...[params.artist ?  {"artistDisplay": {"$regex": new RegExp(params.artist), "$options": 'i'}} : {}]
                ]}},
                ...params.pageNumber ? [{ "$skip": parseInt(params.pageNumber) * 20 }] : [],
                ...params.limit ? [{ "$limit": parseInt(params.limit) }] : [],
            ]);
        return song.toArray()
    }

    public async getSongCount() {
        return this.db.collection(SONG_COLLECTION).countDocuments();
    }

    public async findSong(details: string) {
        console.log('find song', details)
        const indexOfFirstHyphen = details.indexOf(' - ')
        const artistDisplay = details.slice(0, indexOfFirstHyphen);
        const title = details.slice(indexOfFirstHyphen + 3);
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
                    for (const chart2 of to.charts[series]) {
                        if (chart1.chart === chart2.chart) {
                            throw new Error('Cannot merge as both songs appear at different positions in the same chart')
                        }
                    }
                }
                to.charts[series] = [...to.charts[series], ...from.charts[series]]
            }
        }
        await this.db.collection(SONG_COLLECTION).updateOne({ '_id': new ObjectId(toId) }, {'$set': to})
        return this.db.collection(SONG_COLLECTION).deleteOne({ '_id': new ObjectId(fromId) })
    }
}