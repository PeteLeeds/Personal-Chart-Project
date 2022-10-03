import { Router } from "express"
import { ArtistRouter } from "./routes/artist-routes";
import { ChartRouter } from "./routes/chart-routes";
import { SongRouter } from "./routes/song-routes";

export class ServerRouter {
    public static async create() {
        const router = Router()

        router.get('/', (_, res) => {
            res.send('database api')
        })

        router.use('/series', await ChartRouter.create())
        router.use('/song', await SongRouter.create())
        router.use('/artist', await ArtistRouter.create())

        return router;
    }
}