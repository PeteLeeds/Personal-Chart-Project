import { Db, ObjectId } from "mongodb";
import { ArtistQueryParams } from "../types/query-params";
import { getSongChartPipeline } from "./common/add-chart-dates";
import { escapeRegex } from "./common/excape-regex";
import { Song } from "../types/song";
import { Artist } from "../types/artist";
import { sortSongs } from "./common/sort-songs";

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'

const DROPOUT = -1

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
        const artist = await this.db.collection<Artist>(ARTIST_COLLECTION).findOne({ '_id': new ObjectId(artistId) });
        if (!artist) {
            throw new Error('Artist does not exist')
        }
        if (!seriesName) {
            seriesName = Object.keys(
              (await this.db.collection(SONG_COLLECTION).findOne({ 'artistIds': new ObjectId(artistId) }))?.charts
            )[0]
          }
        artist.songs = await this.db.collection(SONG_COLLECTION).aggregate<Song>([
            {"$match": { artistIds: new ObjectId(artistId) }},
            ...getSongChartPipeline(seriesName)
        ]).toArray();
        artist.songs.sort((a,b) => sortSongs(a, b, seriesName || ''))
        artist.series = []
        for (const song of artist.songs) {
            if (!song.charts) {
                throw new Error(`Song ${song.title} has no charts!`);
            }
            // Get distinct set of series this artist appears in
            for (const series of Object.keys(song.charts)) {
                if (!(artist.series.includes(series))) {
                    artist.series.push(series);
                }
            }
            if (!song.charts[seriesName]) {
              continue;
            }
            song.charts[seriesName] = song.charts[seriesName].filter(chart => chart.position != DROPOUT)
            // Sort in ascending order so that peak is at position 0
            song.charts[seriesName].sort((a, b) => a.position - b.position);
            song.peak = song.charts[seriesName][0].position
            song.weeksOn = song.charts[seriesName].length
            song.debut = song.charts[seriesName][0].chart
            // Then sort in date order
            song.charts[seriesName].sort((a, b) => a.date > b.date ? 1 : -1)    
            delete song.charts      
          }
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