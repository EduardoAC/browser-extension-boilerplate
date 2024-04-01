import { Parameter, QueryParameters } from "../types/request.types"

export interface MappingAPIParam {
    apiName: string
    valueMapFn(param: Parameter): Parameter
    removeEmpty: boolean
}
/**
 * Maps query parameters to API names based on the provided mapping configuration.
 * @param params The query parameters to map.
 * @param mapping The mapping configuration for parameter names.
 * @returns The mapped query parameters.
 * @throws Error if the mapping configuration is invalid.
 */
export function mapParamsToApiNames(
    params: QueryParameters = {},
    mapping: { [key: string]: MappingAPIParam },
) {
    const emptyValues: Parameter[] = ["", null]
    return Object.keys(mapping).reduce((apiParams: QueryParameters, key) => {
        const cfg = mapping[key]
        if (typeof params[key] === "undefined") {
            return apiParams
        }

        const apiParamKey = cfg.apiName || key
        let apiParamValue = params[key]
        const hasEmptyValue = emptyValues.includes(apiParamValue)

        if (!cfg.removeEmpty || (cfg.removeEmpty && !hasEmptyValue)) {
            if (cfg.valueMapFn) {
                if (typeof cfg.valueMapFn !== "function") {
                    throw new Error(
                        `Expected valueMapFn to be a function in ${key} mapping config`,
                    )
                }
                apiParamValue = cfg.valueMapFn(apiParamValue)
            }
            apiParams[apiParamKey] = apiParamValue
        }
        return apiParams
    }, {})
}
