import { MongoClient } from 'mongodb'
import { ChartDb } from './db-scripts/chart';
import { MONGO_DB, MONGO_URI } from './config'
import Express from 'express'
import { ServerRouter } from './routes';
import { SongDb } from './db-scripts/song';
import { ArtistDb } from './db-scripts/artist';

const app = Express()

export class Database {
    public chartDb: ChartDb;
    public songDb: SongDb
    public artistDb: ArtistDb;

    public constructor(
        chartDb: ChartDb, 
        songDb: SongDb, 
        artistDb: ArtistDb) 
    {
        this.chartDb = chartDb;
        this.songDb = songDb;
        this.artistDb = artistDb;
    }
}

class App {
    public static async run() {
        console.log('Connecting to db...')
        const db = await new Promise<MongoClient>((resolve, reject) => {
            MongoClient.connect(MONGO_URI).then(db => {
                resolve(db as MongoClient)
            })
            .catch(err => {
                console.error('Error initialising Mongo: ', err)
                reject(err)
            })
        })
        const database = db.db(MONGO_DB);
        const db2 = new Database(ChartDb.init(database), SongDb.init(database), ArtistDb.init(database));

        app.use(Express.urlencoded({ extended: true }))

        app.use((_, res, next) => {
            res.locals = { db: db2 }
            next()
        })

        app.use('/database', await ServerRouter.create())
        app.use(Express.json())

        app.set('port', 8083)
        app.listen(8083, () => {
            console.log('app is listening')
        })
    }
}

App.run()