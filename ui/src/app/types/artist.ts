import { Song } from "./song";

export interface Artist {
    _id: string;
    name: string;
    songs: Song[];
}