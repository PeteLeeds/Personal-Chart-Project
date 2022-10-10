import { Db, ObjectId } from "mongodb";
import { getSongChartPipeline } from "./common/add-chart-dates";

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
        if (!seriesName) {
            seriesName = Object.keys(
              (await this.db.collection(SONG_COLLECTION).findOne({ 'artistIds': new ObjectId(artistId) })).charts
            )[0]
          }
        artist.songs = await this.db.collection(SONG_COLLECTION).aggregate([
            {"$match": { artistIds: new ObjectId(artistId) }},
            ...getSongChartPipeline(seriesName)
        ]).toArray();
        return artist
    }

    public async getArtists(page: number): Promise<unknown> {
        const artist = await this.db.collection(ARTIST_COLLECTION)
        .aggregate([
            { "$sort": {"name": 1} }, 
            { "$skip": page * 20 },
            { "$limit": 20}
        ]);
        return artist.toArray()
    }

    public async getArtistCount() {
        return this.db.collection(ARTIST_COLLECTION).countDocuments();
    }

    public async searchArtists(name: string) {
        console.log('search artists', name)
        const artists = await this.db.collection(ARTIST_COLLECTION)
            .aggregate([
                {"$match":
                    {"name": {"$regex": new RegExp(name), "$options": 'i'}}
                },
                {"$limit": 10}
            ])
        return artists.toArray()
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