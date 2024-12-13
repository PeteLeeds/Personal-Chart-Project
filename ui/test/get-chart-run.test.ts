import { getFullChartRun } from "../src/app/shared/get-chart-run";

describe('getFullChartRun', () => {
    test('should return correctly formatted chart run given chart run', () => {
        const test_run = [
            [
                {"position": 4,"date": "2021-05-29T00:00:00.000Z"},
                {"position": 10,"date": "2021-06-05T00:00:00.000Z"}
            ]
        ]
        const expected_result = "[b]NE[/b] (29/5/2021) [color=#0000FF][b]4[/b]-10-xx[/color]"
        const result = getFullChartRun(test_run)
        expect(result).toEqual(expected_result)
    }),

    test('should return correctly formatted chart run given multiple chart runs', () => {
        const test_run = [
            [
                {"position": 4,"date": "2021-05-29T00:00:00.000Z"},
                {"position": 10,"date": "2021-06-05T00:00:00.000Z"}
            ],
            [
                {"position": 11,"date": "2021-06-19T00:00:00.000Z"}
            ]
        ]
        const expected_result = "[b]NE[/b] (29/5/2021) [color=#0000FF][b]4[/b]-10-xx[/color]\n"
                              + "[b]RE[/b] (19/6/2021) [color=#000000]11-xx[/color]"
        const result = getFullChartRun(test_run)
        expect(result).toEqual(expected_result)
    })
})