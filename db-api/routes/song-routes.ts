import { Router } from "express";
import { Database } from "..";

export class SongRouter {
    private static getDb(res: Record<string, Record<string, unknown>>): Database {
        return res.locals.db as Database
    }

    public static async create() {
        const router = Router()
        /**
         * Get an individual song by id
         */
        router.get('/', async (req, res) => {
            const id = req.query.id as string;
            if (!id) {
                throw new Error("ID not given")
            }
            console.log('get song', req.url)
            res.json(
                await (res.locals.db as Database).songDb.getSong(id)
            )
        })

        // If we call HEAD, we automatically call GET - which is why it wasn't working before
        router.head('/find', async (_, res) => {
            console.log('GET COUNT')
            const count = (await (res.locals.db as Database).songDb.getSongCount()).toString();
            res.set('X-Count', count);
            res.sendStatus(200);
        })

        /**
         * Get a song by its song string
         */
        router.get('/find/:details', async (req, res) => {
            console.log('get song by string');
            res.json(
                await (res.locals.db as Database).songDb.findSong(req.params.details)
            )
        })

        /**
         * Get a list of songs based on parameters
         */
        router.get('/find', async (req, res) => {
            console.log('get multiple songs', req.query);
            res.json(
                await (res.locals.db as Database).songDb.getSongs(req.query)
            )
        })

        /**
         * Update a given song
         */
        router.put('/:id', async (req, res) => {
            console.log('update song')
            res.json(await (res.locals.db as Database).songDb.updateSong(req.params.id, req.body)
            )
        })

        /** 
        * Merge one song's chart runs into another given their ids
        */
        router.delete('/merge/:fromId/:toId', async (req, res) => {
            console.log('merge songs')
            res.json(await (res.locals.db as Database).songDb.mergeSongs(req.params.fromId, req.params.toId)
            )
        })


        return router;
    }
}