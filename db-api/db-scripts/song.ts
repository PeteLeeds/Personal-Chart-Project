import { Db, ObjectId } from "mongodb";
import { Song } from "../types/song";
import { updateArtists } from "./common/update-artists";
import { getSongChartPipeline } from "./common/add-chart-dates";

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

    public async getSongs(sortBy: string, page: number): Promise<unknown> {
        const song = await this.db.collection(SONG_COLLECTION)
            .aggregate([
                { "$sort": { [sortBy]: 1 } },
                { "$skip": page * 20 },
                { "$limit": 20 }
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
}