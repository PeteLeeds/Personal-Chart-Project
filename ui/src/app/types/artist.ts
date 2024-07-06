import { FullSongInfo, Song } from "./song";

export interface Artist {
    _id: string;
    name: string;
    songs: ArtistSong[];
    series: string[]
}

export interface ArtistSong extends Song {
    peak?: number;
    debut: string;
}