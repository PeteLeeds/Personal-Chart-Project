import { splitChartRun } from "./chart-run"

describe('splitChartRun', () => {
    test('should break up runs correctly if dropout in middle', () => {
        const test_run = [
            {'date': '2023-01-15T00:00:00.000Z', 'position': 6, 'chart': 'x'},
            {'date': '2023-01-01T00:00:00.000Z', 'position': 5, 'chart': 'x'},
            {'date': '2023-01-08T00:00:00.000Z', 'position': -1, 'chart': 'x'},
        ]
        const expected_result = [
            [{'date': '2023-01-01T00:00:00.000Z', 'position': 5}],
            [{'date': '2023-01-15T00:00:00.000Z', 'position': 6}]
        ]
        const result = splitChartRun(test_run)
        expect(result).toEqual(expected_result)
    }),

    test('should not end wth empty array if the last value is a dropout', () => {
        const test_run = [
            {'date': '2023-01-01T00:00:00.000Z', 'position': 5, 'chart': 'x'},
            {'date': '2023-01-08T00:00:00.000Z', 'position': -1, 'chart': 'x'},
            {'date': '2023-01-15T00:00:00.000Z', 'position': 6, 'chart': 'x'},
            {'date': '2023-01-22T00:00:00.000Z', 'position': -1, 'chart': 'x'},
        ]
        const expected_result = [
            [{'date': '2023-01-01T00:00:00.000Z', 'position': 5, 'chart': 'x'}],
            [{'date': '2023-01-15T00:00:00.000Z', 'position': 6, 'chart': 'x'}]
        ]
        const result = splitChartRun(test_run)
        expect(result).toEqual(expected_result)
    })
})