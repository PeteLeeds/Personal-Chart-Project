interface BaseQueryParams {
    sortBy?: string;
    pageNumber?: string;
    limit?: string;
}

export interface SongQueryParams extends BaseQueryParams {
    title?: string;
    artist?: string;
}

export interface ArtistQueryParams extends BaseQueryParams {
    name: string;
}