import { ObjectId } from "mongodb";
import { Song } from "./song";

export interface Artist {
    _id: ObjectId;
    name: string;
    songs?: Song[];
    series?: string[]
}