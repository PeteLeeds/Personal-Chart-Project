import { Db, ObjectId } from "mongodb";
import { ArtistQueryParams } from "../types/query-params";
import { getSongChartPipeline } from "./common/add-chart-dates";
import { escapeRegex } from "./common/excape-regex";

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'

export class ArtistDb {
    private db: Db;

    static init(db: Db) {
        return new ArtistDb(db);
    }

    constructor(db: Db) {
        this.db = db;
        console.log('initialised Artist class')
    }
    
    public async getArtist(artistId: string, seriesName?: string): Promise<unknown> {
        const artist = await this.db.collection(ARTIST_COLLECTION).findOne({ '_id': new ObjectId(artistId) });
        if (!artist) {
            throw new Error('Artist does not exist')
        }
        if (!seriesName) {
            seriesName = Object.keys(
              (await this.db.collection(SONG_COLLECTION).findOne({ 'artistIds': new ObjectId(artistId) }))?.charts
            )[0]
          }
        artist.songs = await this.db.collection(SONG_COLLECTION).aggregate([
            {"$match": { artistIds: new ObjectId(artistId) }},
            ...getSongChartPipeline(seriesName)
        ]).toArray();
        return artist
    }

    private getMatchPipeline(params: ArtistQueryParams): Record<string, unknown> {
        const regex_name = escapeRegex(params.name || '')
        return {"$match":
            {"name": {"$regex": new RegExp(regex_name), "$options": 'i'}}
        }
    }

    public getArtists(params: ArtistQueryParams): Promise<unknown> {
        const artist = this.db.collection(ARTIST_COLLECTION)
        .aggregate([
            ...params.sortBy ? [{ "$sort": { [params.sortBy]: 1 } }] : [],
            ...params.name ? [this.getMatchPipeline(params)] : [],
            ...params.pageNumber ? [{ "$skip": parseInt(params.pageNumber) * 20 }] : [],
            ...params.limit ? [{ "$limit": parseInt(params.limit) }] : [],
        ]);
        return artist.toArray()
    }

    public async getArtistCount(params: ArtistQueryParams): Promise<number> {
        const count_object = await this.db.collection(ARTIST_COLLECTION).aggregate([
            ...params.name ? [this.getMatchPipeline(params)] : [],
            {'$count': 'artist_count'}
        ]).toArray();
        return count_object[0].artist_count
    }

    public async mergeArtists(fromId: string, toId: string) {
        // Replace artist id in all relevant songs
        this.db.collection(SONG_COLLECTION).updateMany(
            { "artistIds": new ObjectId(fromId) }, 
            { "$set": { "artistIds.$": new ObjectId(toId) } }
        )
        // Delete 'from' artist
        return this.db.collection(ARTIST_COLLECTION).deleteOne({ '_id': new ObjectId(fromId) })
    }
}