// Adds date of each chart to chart
// TODO: Replace charts.Peter's Charts with an option for each chart.

export function getSongChartPipeline(seriesName: string) {
    //seriesName = "Peter's Charts"
    console.log('Series name', seriesName)
    return [{
        '$unwind': {
            'path': `$charts.${seriesName}`
        }
    }, {
        '$lookup': {
            'from': 'series',
            'let': {
                'chartName': `$charts.${seriesName}.chart`
            },
            'pipeline': [
                {
                    '$match': {
                        'name': seriesName
                    }
                }, {
                    '$project': {
                        'charts': 1
                    }
                }, {
                    '$unwind': '$charts'
                }, {
                    '$match': {
                        '$expr': {
                            '$eq': [
                                '$charts.name', '$$chartName'
                            ]
                        }
                    }
                }
            ],
            'as': 'chart_dates'
        }
    }, {
        '$unwind': {
            'path': '$chart_dates'
        }
    }, {
        '$set': {
            [`charts.${seriesName}.date`]: '$chart_dates.charts.date'
        }
    }, {
        '$group': {
            '_id': '$_id',
            'title': {
                '$first': '$title'
            },
            'artistIds': {
                '$first': '$artistIds'
            },
            'artistDisplay': {
                '$first': '$artistDisplay'
            },
            'tempcharts': {
                '$first': '$charts'
            },
            'tempchartswithdate': {
                '$addToSet': `$charts.${seriesName}`
            }
        }
    }, {
        '$set': {
            ['charts']: '$tempcharts'
        }
    },
    {
        '$set': {
            [`charts.${seriesName}`]: '$tempchartswithdate'
        }
    }, {
        '$project': {
            'tempcharts': 0,
            'tempchartswithdate': 0
        }
    }]
}