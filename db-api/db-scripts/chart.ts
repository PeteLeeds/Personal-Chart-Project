import { AggregationCursor, Db, FindCursor, ObjectId, UpdateResult } from "mongodb"
import { Song } from "../types/song";
import { updateArtists } from "./common/update-artists";
import { Chart, InteractiveChartParams, PutSessionParams, Session, SessionSong } from "../types/chart";
import { getTop40ChartRun, splitChartRun } from "./common/chart-run";
import { ObjectSet } from "./common/object-set";

const SONG_COLLECTION = 'songs'
const ARTIST_COLLECTION = 'artists'
const CHART_COLLECTION = 'series'
const SESSION_COLLECTION = 'interactive-sessions'

const DROPOUT = -1

// Probably need to move this into a file common to ui and db-api
export interface ChartParams {
    name: string;
    date: string;
    songs: SessionSong[]
}

export class ChartDb {
    static init(db: Db) {
        return new ChartDb(db);
    }

    private db: Db

    constructor(db: Db) {
        this.db = db;
        console.log('initialised Chart class')
    }

    public getChartsInSeries(seriesName: string, params: Record<string, string>) {
        const page = parseInt(params.page)
        const order = parseInt(params.order)
        return this.db.collection(CHART_COLLECTION).aggregate([
            { '$match': { name: seriesName } },
            {'$unwind': '$charts'},
            {'$replaceRoot': {'newRoot': '$charts'}},
            { '$match': { 'sessionId': { '$exists': false } } },
            {'$sort': {'date': order}},
            {'$skip': page * 20},
            {'$limit': 20}
        ]).toArray()
    }

    private async getXPreviousCharts(seriesName: String, date: string, number: Number): Promise<string[]> {
        const previousCharts = await this.db.collection(CHART_COLLECTION).aggregate<Chart>([
            { '$match': { name: seriesName } },
            {'$unwind': '$charts'},
            {'$replaceRoot': {'newRoot': '$charts'}},
            { '$match': {$and: [{ date: {'$lt': date} }, {sessionId: {$exists: false}}] }},
            {'$sort': {'date': -1}},
            {'$limit': number},
        ]).toArray()
        return previousCharts.map(chart => chart.name)
    }

    private async getSongsFromCharts(series: string, charts: string[], sort: boolean): Promise<Record<string, string>[]> {
        const fullSongArray = []
        for (const chart of charts) {
            const chartSongs = await this.db.collection(SONG_COLLECTION).aggregate<Record<string, string>>([
                ...this.getSongsPipeline(series, chart),
                ...(sort ? [
                    ...this.replaceChartInfoWithPositionPipeline(series, chart),
                    ...this.getSortPipelineBasedOnDropouts(false)] 
                    : []
                ),
                { '$project': {
                    title: 1,
                    artistDisplay: 1,
                    _id: 1
                }}
            ]).toArray()
            fullSongArray.push(...chartSongs)
        }
        const songArray = [...new ObjectSet<Record<string, string>>(fullSongArray)]
        return songArray
    }

    public getNewSongs(songs: string): Record<string, string>[] {
        if (songs.length === 0) {
            return []
        }
        const songArray = songs.split('\n');
        return songArray.map(song => {
            const indexOfFirstHyphen = song.indexOf(' - ')
            let artist = song.slice(0, indexOfFirstHyphen);
            let title = song.slice(indexOfFirstHyphen + 3);
            return {
                artistDisplay: artist.trim(),
                title: title.trim()
            }
        })
    }

    private shuffle(array: unknown[]): void {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    }

    public async initiateInteractiveChartCreation(seriesName: string, params: InteractiveChartParams): Promise<Record<string, string>> {
        const prevCharts = await this.getXPreviousCharts(seriesName, params.date, params.numberOfCharts)
        const songs = [
            ...await this.getSongsFromCharts(seriesName, prevCharts, params.revealOrder == 'inOrder'),
            ...this.getNewSongs(params.songs)
        ]
        if (params.revealOrder == 'random') {
            this.shuffle(songs)
        }
        const insertedItem = await this.db.collection(SESSION_COLLECTION).insertOne({
            seriesName,
            chartName: params.name,
            date: params.date,
            cutOffNumber: params.cutOffNumber,
            songOrder: songs,
            placedSongs: []
        })
        return {sessionId: insertedItem.insertedId.toString()}
    }

    public getInteractiveSession(sessionId: string): Promise<Session | null> {
        return this.db.collection(SESSION_COLLECTION).findOne<Session>({_id: new ObjectId(sessionId)})
    }

    public updateSession(sessionId: string, sessionData: PutSessionParams): Promise<UpdateResult<Document>> {
        return this.db.collection(SESSION_COLLECTION).updateOne({_id: new ObjectId(sessionId)}, {$set: sessionData})
    }

    public async getChartPreview(sessionId: string) {
        const session = await this.getInteractiveSession(sessionId)
        if (!session) {
            throw new Error('Session not defined!')
        }
        if (session.cutOffNumber < session.placedSongs.length) {
            session.placedSongs = session.placedSongs.slice(0, session.cutOffNumber)
        }
        // Push temporary results into songs
        await this.newChart(session.seriesName, {
            name: session.chartName,
            date: session.date,
            songs: session.placedSongs
        }, sessionId)
        return this.getChart(session.seriesName, session.chartName, undefined, sessionId)
    }

    public newSeries(params: Record<string, unknown>): Promise<unknown> {
        console.log('insert new series', params?.name)
        return this.db.collection(CHART_COLLECTION).insertOne({
            name: params?.name,
            charts: [],
        })
    }

    public async updateChartWeek(songId: string, seriesName: string, chartName: string, songParams: Record<string, string | number>, sessionId?: string): Promise<void> {
        const updateResponse = await this.db.collection(SONG_COLLECTION).updateOne(
            { _id: new ObjectId(songId), [`charts.${seriesName}.chart`]: chartName, [`charts.${seriesName}.sessionId`]: sessionId }, 
            { '$set': { [`charts.${seriesName}.$`]: songParams } }
        )
        if (updateResponse.matchedCount == 0) {
            await this.db.collection<Song>(SONG_COLLECTION).updateOne(
                { _id: new ObjectId(songId) },
                { $push: { [`charts.${seriesName}`]: songParams } }
            )
        }
        return;
    }

    public async getArtistIds(song: Song | SessionSong): Promise<ObjectId[]> {
        const artistIds = []
        if (song.artists) {
            const artists = song.artists;
            // Determine list of artist Ids involved with song (creating new artists if necessary)
            for (const artist of artists) {
                artistIds.push(await updateArtists(this.db.collection(ARTIST_COLLECTION), artist as string))
            }
        }
        return artistIds
    }

    public async newChart(seriesName: string, params: ChartParams, sessionId?: string): Promise<unknown> {
        if (!params.name) {
            throw new Error('Chart name has not been specified')
        }
        const sessionIdParam: Record<string, string> = sessionId ? {sessionId} : {}
        const chartParams = {
            name: params.name,
            date: params.date,
            ...sessionIdParam
        }
        const existing = await this.db.collection(CHART_COLLECTION).findOne({ $and: [
            { "name": seriesName },
            { "charts.name": params.name },
            ...(sessionId ? [ {"charts.sessionId": sessionId}] : [])
        ] })
        if (existing) {
            if (sessionId) {
                await this.db.collection(CHART_COLLECTION).updateOne({ name: seriesName, 'charts.sessionId': sessionId }, { '$set': { 'charts.$': chartParams } })
            } else {
                throw new Error('Chart names within a series must be unique')
            }
        } else {
            // Insert the chart
            await this.db.collection<Chart>(CHART_COLLECTION).updateOne({ name: seriesName },
                {
                    $push: {
                        charts: chartParams
                    }
                }
            )
        }
        const nextChart = await this.getNextChartByDate(seriesName, params.date)
        // Update each required song.
        let position = 1;
        for (const song of params.songs) {
            const newChartPositions = [{ 
                chart: params.name, 
                position,
                ...sessionIdParam
            }]
            if (song._id) {
                await this.updateChartWeek(song._id, seriesName, params.name, newChartPositions[0], sessionId)
                // Update chart position of song (series + chart)
                // If the song isn't in the following chart, mark it as a 'dropout' in that chart
                if (nextChart) {
                    const songObject = await this.db.collection(SONG_COLLECTION).findOne({_id: new ObjectId(song._id)})
                    const nextChartInSong = songObject?.charts[seriesName].find(
                        (chart: Record<string, string>) => chart.chart === nextChart
                    )
                    if (nextChartInSong?.length === 0) {
                        await this.updateChartWeek(song._id, seriesName, params.name, {chart: nextChart, position: DROPOUT, ...sessionIdParam}, sessionId)
                    }
                }
            }
            else {
                const title = song.title;
                const artistDisplay = song.artistDisplay
                const existingSong = await this.db.collection<Song>(SONG_COLLECTION).findOne({ $and: [{ artistDisplay }, { title }] })
                if (existingSong) {
                    song._id = existingSong._id.toString()
                } else {
                    const artistIds = await this.getArtistIds(song)
                    if (nextChart) {
                        newChartPositions.push({chart: nextChart, position: DROPOUT, ...sessionIdParam})
                    }
                    // Insert the new song
                    const newSong = await this.db.collection(SONG_COLLECTION).insertOne({
                        title,
                        artistIds,
                        artistDisplay,
                        charts: { [seriesName]: newChartPositions }
                    })
                    song._id = newSong.insertedId.toString()
                }
                if (sessionId) {
                    this.db.collection(SESSION_COLLECTION).updateOne(
                        {_id: new ObjectId(sessionId), 'placedSongs.artistDisplay': song.artistDisplay, 'placedSongs.title': song.title},
                        { $set: {'placedSongs.$._id': song._id} }
                    )
                }
            }
            position++;
        }
        // Find dropouts from the last chart and mark them as such
        const songIds = params.songs.map(song => new ObjectId(song._id || ''))
        const previousCharts = await (await this.getPreviousChartsByDate(seriesName, params.date)).toArray()
        const previousChart = previousCharts[0]
        if (previousChart) {
            await this.db.collection<Song>(SONG_COLLECTION).updateMany(
                {
                    $and: [{
                        [`charts.${seriesName}`]: {$elemMatch:
                            {
                                chart: previousChart.name,
                                position: {$ne: DROPOUT}
                            }
                        }
                    },
                    {
                        _id: {$nin: songIds}
                    }
                    ]
                },
                { $push: { [`charts.${seriesName}`]: {chart: params.name, position: DROPOUT, ...sessionIdParam} } }
            )
        }
        if (sessionId && existing) {
            // Delete things no longer in chart
            await this.db.collection<Song>(SONG_COLLECTION).updateMany(
                { _id: { $nin: songIds } },
                { 
                    $pull: { 
                        [`charts.${seriesName}`]: {
                            $and: [
                                { sessionId: sessionId }, 
                                { position: { $ne: DROPOUT } }
                            ]
                        }
                    }
                }
            );
        }
        return;
    }

    public async createChartFromSession(sessionId: string, newSongs: Song[]): Promise<{name: string}> {
        const session = await this.getInteractiveSession(sessionId)
        if (!session) {
            throw new Error('Session not defined!')
        }
        await this.db.collection(SONG_COLLECTION).updateMany(
            {[`charts.${session.seriesName}.sessionId`]: sessionId},
            { $unset: { [`charts.${session.seriesName}.$.sessionId`]: "" } }
        )
        for (const song of newSongs) {
            const artistIds = await this.getArtistIds(song)
            console.log('ids', artistIds)
            await this.db.collection(SONG_COLLECTION).updateOne(
                { _id: new ObjectId(song._id) },
                { $set: {artistIds}}
            )
        }
        await this.db.collection(CHART_COLLECTION).updateOne(
            {[`charts.sessionId`]: sessionId},
            { $unset: { [`charts.$.sessionId`]: "" } }
        )
        await this.db.collection(SESSION_COLLECTION).deleteOne(
            {_id: new ObjectId(sessionId)}
        )
        return {name: session.chartName}
    }

    public listSeries(): FindCursor<any> {
        return this.db.collection(CHART_COLLECTION).find();
    }

    public getRecentCharts(): AggregationCursor<Chart[]> {
        return this.db.collection(CHART_COLLECTION).aggregate([
            {'$unwind': '$charts'},
            { '$match': 
                {'charts.sessionId': {$exists: false}},
            },
            {'$sort': {'charts.date': -1}},
            {'$limit': 5},
            {'$project': {
                'series': '$name',
                'name': '$charts.name',
            }}
        ])
    }

    /**
     * Get a pipeline to limit past charts if a specific chart size is chosen
     */
    private getSizePipeline(series: string, size?: string): Record<string, unknown>[] {
        if (!size) {
            return []
        }
        return [{
            $addFields: {
                charts: {
                    [`${series}`]: {
                        $filter: {
                            input: `$charts.${series}`,
                            as: 'chart',
                            cond: { $lte: [`$$chart.position`, parseInt(size)] }
                        }   
                    }
                }
            }
        }]
    }

    private getSongsPipeline(series: string, chartName: string, size?: string, sessionId?: string, dropouts = false) {
        return [{
            $match: {
                [`charts.${series}`]: {
                    $elemMatch:
                    {
                        chart: chartName,
                        position: {
                            ...(!dropouts ? {$ne: DROPOUT} : {$exists: true}),
                            ...(size ? { $lte: parseInt(size) } : {})
                        },
                        $or: [
                            {sessionId:  {$exists: false}},
                            ...(sessionId ? [{sessionId:  {$eq: sessionId}}] : []),
                        ]
                    }
                }
            }
        },]
    }

    public async getChart(series: string, chartName: string, size?: string, sessionId?: string) {
        const songs = await (await this.getChartSongs(series, chartName, size, sessionId)).toArray()
        const previousCharts = await (await this.getPreviousCharts(series, chartName, sessionId)).toArray()
        const nextChart = await this.getNextChart(series, chartName)

        const prevChartNames = previousCharts.map(chart => chart.name);
        const songsWithStats = songs.map((song: Song) => {
            // Index '1' is correct here as '0' will be the current chart
            if (!song.charts) {
                throw new Error(`Song ${song.title} has no charts!`);
            }
            const currentSeries = song.charts[series]
            const charts = currentSeries.filter(
                chart => {
                    if (chart.position == DROPOUT) {
                        return false
                    } else if (prevChartNames.includes(chart.chart)) {
                        if (prevChartNames[0] == chart.chart && sessionId && chart.sessionId != sessionId) {
                            return false
                        }
                        return true
                    }
                    return false
                }
            );
            const lastChartRecord = charts.find(chart => chart.chart === prevChartNames[1] && !chart.sessionId)
            charts.sort((a, b) => a.position - b.position);
            return {
              ...song,
              lastWeek: lastChartRecord?.position,
              weeksOn: charts.length,
              peak: charts[0].position,
            }
          });

        return {
            lastChart: previousCharts[1].name,
            nextChart,
            songs: songsWithStats,
        }
    }

    public getSortPipelineBasedOnDropouts(dropouts: boolean): Record<string, unknown>[] {
        if (dropouts) {
            return [
                {
                    $addFields: {
                      sortKey: { $cond: { if: { $eq: ["$position", -1] }, then: 1, else: 0 } }
                    }
                },
                { $sort: { 'sortKey': 1, 'position': 1 } },
                { $project: { sortKey: 0 } }
            ]
        }
        return [{ $sort: { 'position': 1 } }]
    }

    public replaceChartInfoWithPositionPipeline(series: string, chartName: string, sessionId?: string,): Record<string, unknown>[] {
        // Remove all chart info for the songs besides the specified chart
        return [
            { $addFields: {
                    chartInfo: {
                        $filter: {
                            input: `$charts.${series}`,
                            as: 'chart',
                            cond: { $and: [
                                {$eq: [`$$chart.chart`, chartName]},
                                {$or: [
                                    { $eq: [ { $type: "$$chart.sessionId" }, "missing" ] },
                                    {$eq: [ '$$chart.sessionId', sessionId]}
                                ]}
                            ] }
                        }
                    },
                }
            },
            { $unwind: '$chartInfo' },
            { $addFields: { position: '$chartInfo.position' } },
            { $project: { chartInfo: 0 } },
        ]
    }

    public async getChartSongs(series: string, chartName: string, size?: string, sessionId?: string, dropouts = false): Promise<AggregationCursor<Song>> {
        return this.db.collection(SONG_COLLECTION).aggregate([
            // Find all the songs in this chart
            ...this.getSongsPipeline(series, chartName, size, sessionId, dropouts),
            ...this.getSizePipeline(series, size),
            ...this.replaceChartInfoWithPositionPipeline(series, chartName, sessionId),
            ...this.getSortPipelineBasedOnDropouts(dropouts)
        ])
    }

    public async getPreviousCharts(series: string, chart: string, sessionId?: string): Promise<AggregationCursor<Chart>> {
        const chartDateArray = await (this.db.collection(CHART_COLLECTION).aggregate([
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { name: chart } },
        ]).toArray())
        const chartDate = chartDateArray[0].date
        console.log('get previous', JSON.stringify(chart));
        return this.getPreviousChartsByDate(series, chartDate, sessionId)
    }

    public async getPreviousChartsByDate(series: string, chartDate: string, sessionId?: string): Promise<AggregationCursor<Chart>> {
        const aggregateDb = [
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: {
                $and: [
                    {date: { $lte: chartDate } },
                    {$or: [
                        {sessionId: {$exists: false}},
                        {sessionId}
                    ]}
                ]} },
            { $sort: { date: -1 } },
        ]
        return this.db.collection(CHART_COLLECTION).aggregate(aggregateDb);
    }

    public async getNextChart(series: string, chart: string): Promise<string> {
        const currentChart = await (this.db.collection(CHART_COLLECTION).aggregate([
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: { name: chart } },
        ]).toArray())
        const chartDate = currentChart[0].date
        console.log('get next', JSON.stringify(chart));
        return this.getNextChartByDate(series, chartDate)
    }

    public async getNextChartByDate(series: string, chartDate: string): Promise<string> {
        const aggregateDb = [
            { $match: { name: series } },
            { $unwind: "$charts" },
            { $replaceRoot: { newRoot: "$charts" } },
            { $match: {
                $and: [
                    {date: { $gt: chartDate } },
                    {sessionId: {$exists: false}}
                ]} },            
            { $sort: { date: 1 } },
            { $limit: 1 },
        ]
        const chartArray = await this.db.collection(CHART_COLLECTION).aggregate(aggregateDb).toArray();
        return chartArray[0]?.name
    }

    private getSymbol(weeksOn: number, thisWeek: number, lastWeek?: number) {
        if (!lastWeek || lastWeek > 40) {
            if (weeksOn == 1) {
                return ':ne:'
            }
            return ':re:'
        } else if (thisWeek > lastWeek) {
            return ':down:'
        } else if (thisWeek < lastWeek) {
            return ':up:'
        } else {
            return ':right:'
        }
    }

    public async getFormattedChartString(series: string, chartName: string, size?: string): Promise<Record<string, string>> {
        const songs = await (await this.getChartSongs(series, chartName, size, undefined, true)).toArray()
        const previousCharts = await (await this.getPreviousCharts(series, chartName)).toArray()

        const dropoutSongStrings = []

        let formattedChartString = ""
        for (let i = 0; i < songs.length; i++) {
            if (i == 40) {
                formattedChartString += `[b]Below 40:[/b][size=1]\n\n`
            }
            const song = songs[i]
            if (!song.charts) {
                throw new Error(`Song ${song.title} has no charts!`);
            }
            const currentSeries = song.charts[series]
            const chartPositions = []
            for (const chartPosition of currentSeries) {
                const chart = previousCharts.find(chart => chart.name == chartPosition.chart)
                if (chart) {
                    chartPosition.date = chart.date.toString()
                    chartPositions.push(chartPosition)
                }
            }
            const activeChartPositions = chartPositions.filter(
                chart => chart.position != DROPOUT
            );
            const lastChartRecord = activeChartPositions.find(chart => chart.chart === previousCharts[1].name)
            song.lastWeek = lastChartRecord?.position
            song.weeksOn = activeChartPositions.length
            const weeksOnTop40 = activeChartPositions.filter(chart => chart.position <= 40).length
            activeChartPositions.sort((a, b) => a.position - b.position);
            song.peak = activeChartPositions[0].position
            const lastWeekString = `${song.lastWeek || (song.weeksOn > 1 ? 'RE' : 'NE')}`
            let positionString = `[b]${song.position == -1 ? 'xx' : song.position}[/b] [${lastWeekString}]`
            if (i >= 40 && lastWeekString == 'NE') {
                positionString = `[color=#FF0000]${positionString}[/color]`
            }
            let songString = `${positionString} ${song.artistDisplay} - ${song.title}`
            if (i < 40) {
                const symbol = this.getSymbol(weeksOnTop40, i + 1, song.lastWeek)
                song.chartRuns = splitChartRun(chartPositions)
                const chartRun = getTop40ChartRun(song.chartRuns)
                songString = `${symbol} ${songString} ${chartRun}`
                if ((i + 1) % 10 == 0) {
                    songString += `\n`
                }
            } else {
                const peakString = song.peak == i + 1 ? `[b]${song.peak}[/b]` : song.peak
                songString += ` (Pk: ${peakString})`
            }
            if (song.position == -1 && song.lastWeek && song.lastWeek != -1) {
                dropoutSongStrings.push({string: songString, lastWeek: song.lastWeek})
            } else {
                formattedChartString += `${songString}\n`
            }
        }
        if (dropoutSongStrings.length > 0) {
            dropoutSongStrings.sort((a, b) => a.lastWeek - b.lastWeek)
            formattedChartString += '\n'
            for (const songString of dropoutSongStrings) {
                formattedChartString += `${songString.string}\n`
            }
        }
        if (songs.length > 40) {
            formattedChartString += `[/size]`
        }
        return {'chartString': formattedChartString}
    }

    public async deleteSeries(seriesName: string) {
        // First delete any song info about the series
        console.log("Deleting chart info")
        await this.db.collection(SONG_COLLECTION).updateMany(
            {},
            { $unset: { [`charts.${seriesName}`]: "" } }
        )
        console.log("Deleting song info")
        // Then delete any songs which relied only on this series
        await this.db.collection(SONG_COLLECTION).deleteMany({ $or: [{ charts: {} }, { charts: { $exists: false } }] })
        // TODO: Also delete artists which don't have any songs
        // Then delete the series itself
        console.log("Deleting series")
        return this.db.collection(CHART_COLLECTION).deleteOne({ "name": seriesName })
    }

    public async deleteChart(seriesName: string, chartName: string) {
        // First delete any song info about the series
        console.log("Deleting chart info")
        await this.db.collection<Song>(SONG_COLLECTION).updateMany(
            {},
            { '$pull': { [`charts.${seriesName}`]: {chart: chartName} }}
        )
        // Then delete any song series which only contained this chart
        console.log('Deleting series info')
        await this.db.collection(SONG_COLLECTION).updateMany(
            {[`charts.${seriesName}`]: {'$size': 0}},
            { '$unset': { [`charts.${seriesName}`]: "" } }
        )
        // Then delete any songs which relied only on this series
        console.log("Deleting song info")
        await this.db.collection(SONG_COLLECTION).deleteMany({ $or: [{ charts: {} }, { charts: { $exists: false } }] })
        // TODO: Also delete artists which don't have any songs
        // Then delete the chart itself
        console.log("Deleting chart")
        return this.db.collection<Chart>(CHART_COLLECTION).updateMany(
            { "name": seriesName }, 
            { '$pull': { 'charts': { 'name': chartName}  }}
        )
    }


    public async getChartDate(seriesName: string, chartName: string): Promise<string> {
        const result = await this.db.collection(CHART_COLLECTION).aggregate(
            [
                {
                    '$match': {
                        'name': seriesName
                    }
                }, {
                    '$unwind': {
                        'path': '$charts'
                    }
                }, {
                    '$replaceRoot': {
                        'newRoot': '$charts'
                    }
                }, {
                    '$match': {
                        'name': chartName
                    }
                }
            ]
        ).toArray()
        return result[0].date
    }

    public async updateChart(seriesName: string, chartName: string, newChartData: Record<string, unknown>): Promise<unknown> {
        console.log('updating', seriesName, chartName, newChartData)
        // First, update the chart
        await this.db.collection(CHART_COLLECTION).updateOne({ name: seriesName, 'charts.name': chartName }, { '$set': { 'charts.$': newChartData } })
        // Next, update the songs containing that chart
        await this.db.collection(SONG_COLLECTION).updateMany(
            { [`charts.${seriesName}.chart`]: chartName },
            { '$set': { [`charts.${seriesName}.$.chart`]: newChartData.name } }
        )
        return;
    }
}