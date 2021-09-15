import { Router } from "express"
import { ChartRouter } from "./routes/chart-routes";

export class ServerRouter {
    public static async create() {
        const router = Router()

        router.get('/', (_, res) => {
            res.send('database api')
        })

        router.use('/series', await ChartRouter.create())

        return router;
    }
}