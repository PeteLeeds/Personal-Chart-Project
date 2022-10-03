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
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).songDb.getSong(id)
            )
        })

        // If we call HEAD, we automatically call GET - which is why it wasn't working before
        router.head('/find', async (_, res) => {
            console.log('GET COUNT')
            const count = (await this.getDb(res as unknown as Record<string, Record<string, unknown>>).songDb.getSongCount()).toString();
            res.set('X-Count', count);
            res.sendStatus(200);
        })

        /**
         * Get a song by its song string
         */
        router.get('/find/:details', async (req, res) => {
            console.log('get song by string');
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).songDb.findSong(req.params.details)
            )
        })

        /**
         * Get a list of songs based on parameters
         */
        router.get('/find', async (req, res) => {
            console.log('get multiple songs');
            const sortBy = req.query.sortBy as string;
            const page = parseInt(req.query.page as string)
            if (!sortBy || (!page && !(page == 0))) {
                throw new Error("SortBy or Page not defined")
            }
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).songDb.getSongs(sortBy, page)
            )
        })

        /**
         * Update a given song
         */
        router.put('/:id', async (req, res) => {
            console.log('update song')
            res.json(await this.getDb(res as unknown as Record<string, Record<string, unknown>>).songDb.updateSong(req.params.id, req.body)
            )
        })


        return router;
    }
}