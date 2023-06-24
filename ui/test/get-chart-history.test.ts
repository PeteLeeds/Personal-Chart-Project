import { getChartHistory, sortSongs } from "../src/app/shared/get-chart-history";
import artistData from "./data/artist-data.json"

const SELECTED_SERIES = 'test series'

describe('sort songs', () => {
    test('should return the correct number when one date specified', () => {
        const songA = {
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': new Date('2023-01-01')
                    }
                ]
            }
        }
        const songB = {
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': new Date('2022-01-01')
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
                        'date': new Date('2023-01-01')
                    },
                    {
                        'date': new Date('2021-01-01')
                    }
                ]
            }
        }
        const songB = {
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': new Date('2022-01-01')
                        
                    },
                    {
                        'date': new Date('2022-01-08')
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
                        'date': new Date('2023-01-01')
                    },
                    {
                        'date': new Date('2021-01-01'),
                        'position': 5
                    }
                ]
            }
        }
        const songB = {
            charts: {
                [SELECTED_SERIES]: [
                    {
                        'date': new Date('2022-01-01')
                        
                    },
                    {
                        'date': new Date('2021-01-01'),
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