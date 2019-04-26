
const robots = {
    userInput: require('./robots/userInput.robots'),
    text: require('./robots/text.robots'),
    state: require('./robots/state.robots')
}

async function start() {

    await robots.userInput()
    await robots.text()

    const content = robots.state.load()
    console.dir (content,  {depth: null})
}
start()