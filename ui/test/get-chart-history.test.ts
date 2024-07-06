import { getChartHistory } from "../src/app/shared/get-chart-history";
import artistData from "./data/artist-data.json"

describe('getChartHistory', () => {
    it('should return correct chart history', () => {
        console.log(artistData)
        const result = getChartHistory(artistData)
        const expected_result = "[b]7Chariot[/b]\n"
                              + "[size=1]2021 [b]19[/b] Bad Dreams [i](Bakermat ft. 7Chariot)[/i]\n"
                              + "[/size]"
        expect(result).toBe(expected_result)
    })
})