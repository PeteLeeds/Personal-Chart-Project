import { getChartHistory, sortSongs } from "../src/app/shared/get-chart-history";
import artistData from "./data/artist-data.json"

const SELECTED_SERIES = 'test series'

describe('sort songs', () => {
    test('should return the correct number when one date specified', () => {
        const songA = {
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': '2023-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
        const songB = {
            charts: {
                [SELECTED_SERIES]: [
                    {
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
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': '2023-01-01T00:00:00.000Z'
                    },
                    {
                        'date': '2021-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
        const songB = {
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': '2022-01-01T00:00:00.000Z'
                        
                    },
                    {
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
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': '2023-01-01T00:00:00.000Z'
                    },
                    {
                        'date': '2021-01-01T00:00:00.000Z',
                        'position': 5
                    }
                ]
            }
        }
        const songB = {
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': '2022-01-01T00:00:00.000Z'
                        
                    },
                    {
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

describe('getChartHistory', () => {
    it('should return correct chart history', () => {
        console.log(artistData)
        const result = getChartHistory(artistData, SELECTED_SERIES)
        const expected_result = "[b]7Chariot[/b]\n[size=1]2021 [b]19[/b] Bad Dreams [i](Bakermat ft. 7Chariot)[/i]\n[/size]"
        expect(result).toBe(expected_result)
    })
})