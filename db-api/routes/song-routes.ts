import { Router } from "express";
import { Database } from "..";

export class SongRouter {

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

        // If we call HEAD, we automatically call GET, so a new route is needed here
        router.head('/find', async (req, res) => {
            console.log('GET COUNT')
            const count = (await (res.locals.db as Database).songDb.getSongCount(req.query)).toString();
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

        router.get('/totals', async(req, res) => {
            console.log('get leaderboard')
            res.json(await (res.locals.db as Database).songDb.getLeaderboard(req.query as Record<string, string>)
            )
        })


        return router;
    }
}