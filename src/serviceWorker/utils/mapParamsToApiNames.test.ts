import { Parameter } from "../types/request.types"
import { mapParamsToApiNames, MappingAPIParam } from "./mapParamsToApiNames"

describe("mapParamsToApiNames", () => {
    // Test case when params and mapping are empty
    it("should return an empty object when params and mapping are empty", () => {
        const params = {}
        const mapping: { [key: string]: MappingAPIParam } = {}
        const result = mapParamsToApiNames(params, mapping)
        expect(result).toEqual({})
    })

    // Test case with basic mapping
    it("should correctly map query parameters according to the provided mapping configuration", () => {
        const params = {
            name: "John",
            age: 30,
            country: "USA",
            hobby: null,
            search: "",
        }
        const mapping: { [key: string]: MappingAPIParam } = {
            name: {
                apiName: "userName",
                valueMapFn: (param) => String(param).toUpperCase(),
                removeEmpty: false,
            },
            age: {
                apiName: "userAge",
                valueMapFn: (param: number) => param * 2,
                removeEmpty: false,
            },
            country: {
                apiName: "userCountry",
                valueMapFn: (param) => param,
                removeEmpty: true,
            },
            hobby: {
                apiName: "userHobby",
                valueMapFn: (param) => param,
                removeEmpty: true,
            },
            search: {
                apiName: "searchQuery",
                valueMapFn: (param) => param,
                removeEmpty: false,
            },
        }
        const expected = {
            userName: "JOHN",
            userAge: 60,
            userCountry: "USA",
            searchQuery: "",
        }
        const result = mapParamsToApiNames(params, mapping)
        expect(result).toStrictEqual(expected)
    })

    // Test case when valueMapFn is not a function
    it("should throw an error when valueMapFn is not a function", () => {
        const params = { name: "John" }
        const mapping: { [key: string]: MappingAPIParam } = {
            name: {
                apiName: "userName",
                valueMapFn: "invalidFunction" as unknown as (
                    param: Parameter,
                ) => Parameter, // valueMapFn should be a function
                removeEmpty: false,
            },
        }
        expect(() => mapParamsToApiNames(params, mapping)).toThrowError(
            "Expected valueMapFn to be a function in name mapping config",
        )
    })
})
