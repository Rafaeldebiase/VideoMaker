const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.robots')

const googleSearchCredentials = require('../credentials/googleSearch.credentials')

async function robot() {
    const content = state.load()

    await fetchImagesOfAllSentences(content)
    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.image = await fetchGoogleAndReturnImagesLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            num: 2
        })

        const imageUrl = response.data.items.map((item) => {
            return item.link
        })

        return imageUrl
    }
}

module.exports = robot