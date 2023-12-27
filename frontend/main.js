import { setupLogin } from './login.js'

import { Setup } from './setup.js'
import { Social } from './social.js'

const client = new Colyseus.Client()

function eventDispacher()
{
    const handlers = new Array()

    return {
        subscribe : (handler) => handlers.push(handler),
        dispach : (event) =>  handlers.forEach(handler => handler(event))
    }
}


setupLogin(async (id, name) => {
    
    const room = await client.joinOrCreate('game', { id, name })

    room.accountID = id
    room.playerDispacher = eventDispacher()
    room.hintDispacher = eventDispacher()

    const stages = new Map()
    stages.set('Setup', Setup(room))
    stages.set('Social', Social(room))

    // setup player dispacher
    room.state.players.onAdd((player, _) => {
        room.playerDispacher.dispach(player)
        player.onChange(() => room.playerDispacher.dispach(player))
    })
    for (const player of room.state.players.values()) 
    {
        player.onChange(() => room.playerDispacher.dispach(player))
    }

    // setup hint dispacher
    room.state.readableHints.onAdd((hint, _) => {
        room.hintDispacher.dispach(hint)
    })
    room.hintDispacher.dispach()


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
    
})