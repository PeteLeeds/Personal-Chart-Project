import { Router } from "express";
import { Database } from "..";

export class ArtistRouter {
    private static getDb(res: Record<string, Record<string, unknown>>): Database {
        return res.locals.db as Database
    }

    public static async create() {
        const router = Router()
        /**
         * Get an individual artist by id
         */
        router.get('/', async (req, res) => {
            const id = req.query.id as string;
            if (!id) {
                throw new Error("ID not given")
            }
            console.log('get artist', req.url)
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).artistDb.getArtist(id)
            )
        })

        /**
         * Get a list of artists based on parameters
         */
        router.get('/find', async (req, res) => {
            console.log('get multiple artists');
            const page = parseInt(req.query.page as string)
            if (!page && !(page == 0)) {
                throw new Error("Page not defined")
            }
            res.json(
                await this.getDb(res as unknown as Record<string, Record<string, unknown>>).artistDb.getArtists(page)
            )
        })

        // Ideally the head of the GET would be the count
        // But for some reason it doesn't like that
        // So I've included another route here
        router.head('/count', async (_, res) => {
            console.log('GET COUNT')
            const count = (await this.getDb(res as unknown as Record<string, Record<string, unknown>>).artistDb.getArtistCount()).toString();
            res.set('X-Count', count);
            res.sendStatus(200);
        })

        /** 
        * Search for an artist given name string
        */
        router.get('/search', async (req, res) => {
            console.log('search for artist')
            res.json(await this.getDb(res as unknown as Record<string, Record<string, unknown>>).artistDb.searchArtists(req.query.name as string)
            )
        })

        /** 
        * Merge one artist's chart runs into another given their ids
        */
        router.delete('/merge/:fromId/:toId', async (req, res) => {
            console.log('merge artists')
            res.json(await this.getDb(res as unknown as Record<string, Record<string, unknown>>).artistDb.mergeArtists(req.params.fromId, req.params.toId)
            )
        })

        return router;
    }

}