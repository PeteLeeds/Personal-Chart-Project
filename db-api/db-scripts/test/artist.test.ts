import { ObjectId } from "mongodb"
import { sortSongs } from "../common/sort-songs"

const SELECTED_SERIES = 'test series'

const BASE_SONG_INFO = {
    _id: new ObjectId('abc'),
    title: 'test',
    artistDisplay: 'test',
    artistIds: []
}

const BASE_CHART_INFO = {
    chart: 'test',
    position: 1
}

describe('sort songs', () => {
    test('should return the correct number when one date specified', () => {
        const songA = {
            ...BASE_SONG_INFO,
            charts: {
                [SELECTED_SERIES]: [
                    {
                        ...BASE_CHART_INFO,
                        'date': '2023-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
        const songB = {
            ...BASE_SONG_INFO,
            charts: {
                [SELECTED_SERIES]: [
                    {
                        ...BASE_CHART_INFO,
                        'date': '2022-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
        const result = sortSongs(songA, songB, SELECTED_SERIES)
        expect(result).toBe(1)
    }),

    test('should return the correct number when multiple dates specified', () => {
        const songA = {
            ...BASE_SONG_INFO,
            charts: {
                [SELECTED_SERIES]: [
                    {
                        ...BASE_CHART_INFO,
                        'date': '2023-01-01T00:00:00.000Z'
                    },
                    {
                        ...BASE_CHART_INFO,
                        'date': '2021-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
        const songB = {
            ...BASE_SONG_INFO,
            charts: {
                [SELECTED_SERIES]: [
                    {
                        ...BASE_CHART_INFO,
                        'date': '2022-01-01T00:00:00.000Z'
                        
                    },
                    {
                        ...BASE_CHART_INFO,
                        'date': '2022-01-08T00:00:00.000Z'
                    }
                ]
            }
        }
        const result = sortSongs(songA, songB, SELECTED_SERIES)
        expect(result).toBe(-1)
    }),

    test('should return the difference in entry positions when earliest dates are equal', () => {
        const songA = {
            ...BASE_SONG_INFO,
            charts: {
                [SELECTED_SERIES]: [
                    {
                        ...BASE_CHART_INFO,
                        'date': '2023-01-01T00:00:00.000Z'
                    },
                    {
                        ...BASE_CHART_INFO,
                        'date': '2021-01-01T00:00:00.000Z',
                        'position': 5
                    }
                ]
            }
        }
        const songB = {
            ...BASE_SONG_INFO,
            charts: {
                [SELECTED_SERIES]: [
                    {
                        ...BASE_CHART_INFO,
                        'date': '2022-01-01T00:00:00.000Z'
                        
                    },
                    {
                        ...BASE_CHART_INFO,
                        'date': '2021-01-01T00:00:00.000Z',
                        'position': 1
                    }
                ]
            }
        }
        const result = sortSongs(songA, songB, SELECTED_SERIES)
        expect(result).toBe(4)
    })
})