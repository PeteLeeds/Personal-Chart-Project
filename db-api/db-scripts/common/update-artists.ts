import { Collection, ObjectId } from "mongodb";

export async function updateArtists(collection: Collection, artistName: string): Promise<ObjectId> {
    const existingArtist = await collection.findOne({ name: artistName })
    if (existingArtist) {
        console.log('existing artist', JSON.stringify(existingArtist))
        return existingArtist._id;
    }
    else {
        const newArtist = await collection.insertOne({ name: artistName })
        return newArtist.insertedId;
    }
}
