import { getChartHistory, getMarkdownChartHistory } from "../src/app/shared/get-chart-history";
import artistData from "./data/artist-data.json"

describe('when getting BBCode chart history', () => {
    it('should return correctly formatted chart history', () => {
        const result = getChartHistory(artistData)
        const expected_result = "[b]7Chariot[/b]\n"
                              + "[size=1]2021 [b]19[/b] Bad Dreams [i](Bakermat ft. 7Chariot)[/i]\n"
                              + "2022 [color=#0000FF][b]09[/b][/color] Good Dreams\n"
                              + "[/size]"
        expect(result).toBe(expected_result)
    })
})

describe('when getting Markdown chart history', () => {
    it('should return correctly formatted chart history', () => {
        const result = getMarkdownChartHistory(artistData)
        const expected_result = "**7Chariot**\n\n"
                              + "2021 19 Bad Dreams *(Bakermat ft. 7Chariot)*\n\n"
                              + "2022 **09** Good Dreams\n\n"
        expect(result).toBe(expected_result)
    })
})