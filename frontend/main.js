import { Login } from './scripts/login.js'

import { Setup } from './scripts/setup.js'
import { Social } from './scripts/social.js'
import { Vote } from './scripts/vote.js'
import { End } from './scripts/end.js'

const client = new Colyseus.Client()
main()

async function main()
{
    await loadDynamicSections()
    const res = await Login()
    const room = await client.joinOrCreate('game', res)

    room.accountID = res.id
    room.playerDispacher = eventDispacher()
    room.hintDispacher = eventDispacher()

    const stages = new Map()
    stages.set('Setup', Setup(room))
    stages.set('Social', Social(room))
    stages.set('Vote', Vote(room))
    stages.set('End', End(room))

    // setup player dispacher
    {
        room.state.players.onAdd((player, _) => {
            room.playerDispacher.dispach(player)
            player.onChange(() => room.playerDispacher.dispach(player))
        })
        for (const player of room.state.players.values()) 
        {
            player.onChange(() => room.playerDispacher.dispach(player))
        }
    }

    // setup hint dispacher
    {
        room.state.readableHints.onAdd((hint, _) => {
            room.hintDispacher.dispach(hint)
        })
        room.hintDispacher.dispach()
    }

    // stage handler
    room.state.onChange(() => {

        for (const [key, stage] of stages.entries()) 
        {
            if(key == room.state.stage)
            {
                stage.show()
            }
            else
            {
                stage.hide()
            }
        }

        console.log(room.state.stage + ' ' + room.state.turn)
    })

    // handle server error
    room.onError((code, reason) => {
        console.log(`server had an error '${reason}' [${code}]`)
        document.location.reload()
    })

    // handle lost connection
    room.onLeave((code) => {
        console.log(`server not available [${code}]`)
        document.location.reload()
    })
}

function eventDispacher()
{
    const handlers = new Array()

    return {
        subscribe : (handler) => handlers.push(handler),
        dispach : (event) =>  handlers.forEach(handler => handler(event))
    }
}

async function loadDynamicSections()
{
    const loads = new Array()
    const sections = document.getElementsByTagName('section')
    for (const section of sections) 
    {
        const page = section.getAttribute('href')
        if(page)
        {
            section.classList.add('disabled')
            loads.push(
                fetch(page)
                .then(data => data.text())
                .then(text => section.innerHTML = text)
                .catch(err => console.log(`section cannot be loaded -> ${err}`))
            )
        }
    }

    await Promise.all(loads)
}