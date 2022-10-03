import { Db, MongoClient } from 'mongodb'
import { SeriesDb } from './db-scripts/series';
import { MONGO_DB, MONGO_URI } from './config'
import Express from 'express'
import { ServerRouter } from './routes';
import BodyParser from 'body-parser'
import { SongDb } from './db-scripts/song';
import { ArtistDb } from './db-scripts/artist';

const app = Express()

export class Database {
    public seriesDb: SeriesDb;
    public songDb: SongDb
    public artistDb: ArtistDb;

    public constructor(
        seriesDb: SeriesDb, 
        songDb: SongDb, 
        artistDb: ArtistDb) 
    {
        this.seriesDb = seriesDb;
        this.songDb = songDb;
        this.artistDb = artistDb;
    }
}

class App {
    public static async run() {
        console.log('Connecting to db...')
        const db = await new Promise<MongoClient>((resolve, reject) => {
            MongoClient.connect(MONGO_URI, { useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    console.error('Error initialising Mongo: ', err)
                    reject(err)
                }
                resolve(db)
            })
        })
        const database = db.db(MONGO_DB);
        const db2 = new Database(SeriesDb.init(database), SongDb.init(database), ArtistDb.init(database));

        app.use(BodyParser.urlencoded({ extended: true }))
        app.use(BodyParser.json())

        app.use((_, res, next) => {
            res.locals = { db: db2 }
            next()
        })

        app.get('/', (_, res) => {
            console.log('here!!!');
            res.send('it is working')
        });

        app.use('/database', await ServerRouter.create())
        app.use(Express.json())

        app.set('port', 8083)
        app.listen(8083, () => {
            console.log('app is listening')
        })
    }
}

App.run()