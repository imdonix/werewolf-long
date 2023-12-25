import { setupLogin } from './login.js'
import { Setup } from './setup.js'

const client = new Colyseus.Client()

setupLogin(async (id, name) => {
    
    const room = await client.joinOrCreate('game', { id, name })
    const stages = new Map()
    stages.set('Setup', Setup(room))

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