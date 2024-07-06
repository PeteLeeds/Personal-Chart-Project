import { FullSongInfo, Song } from "./song";

export interface Artist {
    _id: string;
    name: string;
    songs: ArtistSong[];
}

export interface ArtistSong extends Song {
    peak?: number;
    debut: string;
}