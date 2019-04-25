
const robots = {
    userInput: require('./robots/userInput.robots'),
    text: require('./robots/text.robots')
}

async function start() {
    const content = {}

    
    await robots.userInput(content)
    await robots.text(content)

    

    console.log(content)
}

start()