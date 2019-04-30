
const robots = {
    userInput: require('./robots/userInput.robots'),
    text: require('./robots/text.robots'),
    state: require('./robots/state.robots'),
    image: require('./robots/image.robots')
}

async function start() {

    // await robots.userInput()
    // await robots.text()
    await robots.image()

    // const content = robots.state.load()
    // console.dir (content,  {depth: null})
}
start()