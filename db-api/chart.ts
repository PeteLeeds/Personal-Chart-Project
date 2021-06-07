import { Db } from "mongodb"
import Express from 'express'

const app = Express()

const SONG_COLLECTION = 'songs'

export class ChartDb {
     static init(db: Db) {
        return new ChartDb(db);
    }

    private db: Db
    // Should probably go into a dedicated 'routes' file when I get to grips with it a bit more
    private app = Express()
    
    constructor(db: Db) {
        this.db = db;
        console.log('initialised Chart class')
    }

    public getChart(): Promise<Record<string, unknown>[]> {
        return this.db.collection(SONG_COLLECTION).find().toArray()
    }
}