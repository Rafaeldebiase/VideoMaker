
const robots = {
    userInput: require('./robots/userInput.robots'),
    text: require('./robots/text.robots')
}

async function start() {
    const content = {
        maximumSentences: 7
    }

    await robots.userInput(content)
    await robots.text(content)

    console.log(JSON.stringify(content, null, 4))
}
start()