export function preEmptArtistName(title: string, artistDisplay: string): string[] {
    const conjunctions = ['ft.', 'feat.', 'with']
    const artistList = []
    let artistsAdded = false
    for (const conjunction of conjunctions) {
      if (artistDisplay.includes(conjunction)) {
        const startOfConjunction = artistDisplay.includes("(" + conjunction) 
                                ? artistDisplay.indexOf("(" + conjunction)
                                : artistDisplay.indexOf(conjunction)
        const startOfArtist = startOfConjunction + conjunction.length 
                                + (artistDisplay.includes("(" + conjunction) ? 1 : 0)
        const endPos = artistDisplay.includes(")", startOfArtist) ? title.indexOf(")", startOfArtist) : undefined
        const featuredArtist = artistDisplay.slice(startOfArtist, endPos)
        artistList.push(artistDisplay.slice(0, startOfConjunction - 1).trim())
        artistList.push(featuredArtist.trim())
        artistsAdded = true
        // More than one conjunction would confuse this simple system too much
        break
      }
    }
    if (!artistsAdded) {
      artistList.push(artistDisplay)
    }
    for (const conjunction of conjunctions) {
      if (title.includes("(" + conjunction)) {
        // + 1 for the bracket
        const startPos = title.indexOf("(" + conjunction) + conjunction.length + 1
        const endPos = title.includes(")", startPos) ? title.indexOf(")", startPos) : title.length - 1
        const featuredArtist = title.slice(startPos, endPos)
        artistList.push(featuredArtist.trim())
        // More than one conjunction would confuse this simple system too much
        break
      }
    }
    return artistList
  }