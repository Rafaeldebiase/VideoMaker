const algorithmia = require('algorithmia')
const algorithmiaKey = require('../credentials/algorithmia.credentials').apiKey
const sentenceBoudaryDetection = require('sbd')

async function robots(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAutenticad = algorithmia(algorithmiaKey)
        const wikipediaAlgorithm = algorithmiaAutenticad.algo("web/WikipediaParser/0.1.2?timeout=300")
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const withoutDatesInParethenses = removeDateInParentheses(withoutBlankLinesAndMarkDown)
        
        content.sourceContentSanitize = withoutDatesInParethenses

        function removeBlankLinesAndMarkDown(text) {
            const allLines = text.split('\n') 
            const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })

            return withoutBlankLinesAndMarkDown.join(' ')
        }

        function removeDateInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []
        const sentences = sentenceBoudaryDetection.sentences(content.sourceContentSanitize)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robots  