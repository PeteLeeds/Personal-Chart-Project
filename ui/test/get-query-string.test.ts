import { getQueryString } from "../src/app/shared/get-query-string"

describe('getQueryString', () => {
    it('should correctly convert key-value pair into string', () => {
        const testData = {testKey: 'testValue'}
        const result = getQueryString(testData)
        expect(result).toBe('testKey=testValue')
    }),

    it('should correctly convert multiple key-value pairs into string', () => {
        const testData = {
            testKey: 'testValue',
            testKey2: 'testValue2'
        }
        const result = getQueryString(testData)
        expect(result).toBe('testKey=testValue&testKey2=testValue2')
    })
})