import { Router } from "express";
import { Database } from "..";

export class ArtistRouter {

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
                await (res.locals.db as Database).artistDb.getArtist(id, req.query.seriesName as string)
            )
        })

        /**
         * Get a list of artists based on parameters
         */
        router.get('/find', async (req, res) => {
            console.log('get multiple artists');
            res.json(
                await (res.locals.db as Database).artistDb.getArtists(req.query)
            )
        })

        // Ideally the head of the GET would be the count
        // But for some reason it doesn't like that
        // So I've included another route here
        router.head('/count', async (req, res) => {
            console.log('GET COUNT')
            const count = (await (res.locals.db as Database).artistDb.getArtistCount(req.query)).toString();
            res.set('X-Count', count);
            res.sendStatus(200);
        })

        /** 
        * Merge one artist's chart runs into another given their ids
        */
        router.delete('/merge/:fromId/:toId', async (req, res) => {
            console.log('merge artists')
            res.json(await (res.locals.db as Database).artistDb.mergeArtists(req.params.fromId, req.params.toId)
            )
        })

        return router;
    }

}