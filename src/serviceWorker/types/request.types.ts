export type Parameter = string[] | string | number | boolean | null

export interface QueryParameters {
    [key: string]: Parameter
}
