const algorithmia = require('algorithmia')
const algorithmiaKey = require('../credentials/algorithmia.credentials').apiKey
const sentenceBoudaryDetection = require('sbd')
const watsonNaturalLanguageUnderstanding = require('../credentials/watsonNaturalLanguageUnderstanding.credentials')
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');

const nlu = new NaturalLanguageUnderstandingV1({
    username: watsonNaturalLanguageUnderstanding.username,
    password: watsonNaturalLanguageUnderstanding.password,
    iam_apikey: watsonNaturalLanguageUnderstanding.apikey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

const state = require('./state.robots')

async function robots() {
    const content = state.load()
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

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

    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeyowrds(sentence.text)
        }
    }

    async function fetchWatsonAndReturnKeyowrds(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error
                }

                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })

                resolve(keywords)
            })
        })
    }
}

module.exports = robots  