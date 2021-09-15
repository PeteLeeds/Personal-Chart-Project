import { Cursor, Db } from "mongodb"

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'
const CHART_COLLECTION = 'series'

// Probably need to move this into a file common to ui and db-api
export interface ChartParams {
    name: string;
    date: Date;
    songs: string[]
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

    public getChart(): Promise<Record<string, unknown>[]> {
        return this.db.collection(SONG_COLLECTION).find().toArray()
    }

    public getSeriesByName(seriesName: string) {
        return this.db.collection(CHART_COLLECTION).findOne({ name: seriesName })
    }

    public newSeries(params: Record<string, unknown>): Promise<unknown> {
        console.log('insert new series', params?.name)
        return this.db.collection(CHART_COLLECTION).insertOne({
            name: params?.name,
            charts: [],
        })
    }

    public async newChart(seriesName: string, params: ChartParams): Promise<unknown> {
        const existing = await this.db.collection(CHART_COLLECTION).findOne({ $and: [{ "name": seriesName }, { "charts.name": params.name }] })
        if (existing) {
            throw new Error('Chart names within a series must be unique')
        }

        // Update each required song.
        let position = 1;
        for (const song of params.songs) {
            let [artist, title] = song.split('-')
            artist = artist.trim(); title = title.trim();
            const existingSong = await this.db.collection(SONG_COLLECTION).findOne({ title, artistDisplay: artist });
            if (existingSong) {
                // Update chart position of song (series + chart)
                await this.db.collection(SONG_COLLECTION).updateOne(
                    { title, artistDisplay: artist },
                    { $push: { [`charts.${seriesName}`]: { chart: params.name, position } } }
                )
            }
            else {
                // Determine list of artist Ids involved with song (creating new artists if necessary)
                const artistIds = []
                const existingArtist = await this.db.collection(ARTIST_COLLECTION).findOne({ name: artist })
                if (existingArtist) {
                    console.log('existing artist', JSON.stringify(existingArtist))
                    artistIds.push(existingArtist._id);
                }
                else {
                    const newArtist = await this.db.collection(ARTIST_COLLECTION).insertOne({ name: artist })
                    artistIds.push(newArtist.insertedId);
                }
                // Insert the new song
                await this.db.collection(SONG_COLLECTION).insertOne({ 
                    title, 
                    artistIds, 
                    artistDisplay: artist, 
                    charts: {[seriesName]: [{ chart: params.name, position }]}
                })
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
}