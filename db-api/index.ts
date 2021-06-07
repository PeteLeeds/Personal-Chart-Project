import { Db, MongoClient } from 'mongodb'
import { ChartDb } from './chart';
import { MONGO_DB, MONGO_URI } from './config'
import Express from 'express'
import { ServerRouter } from './routes';

const app = Express()

export class Database {
    public chartDb: ChartDb;

    public constructor(chartDb: ChartDb) {
        this.chartDb = chartDb
    }
}

class App {
    public static async run() {
        console.log('Connecting to db...')
        const db = await new Promise<MongoClient> ((resolve, reject) => {
            MongoClient.connect(MONGO_URI, {useUnifiedTopology: true},  (err, db) => {
                if (err) {
                    console.error('Error initialising Mongo: ', err)
                    reject(err)
                }
                resolve(db)
            })
        })
        const database = db.db(MONGO_DB)
        const db2 = new Database(ChartDb.init(database));
        app.use((_, res, next) => {
            res.locals = {db: db2}                
            next()
        })

        app.get('/', (_, res) => {
            console.log('here!!!');
            res.send('it is working')
        });
        
        app.use('/database', await ServerRouter.create())
        
        app.set('port', 8083)
        app.listen(8083, () => {
            console.log('app is listening')
        })
    }
}

App.run()