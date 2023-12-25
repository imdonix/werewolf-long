import { setupLogin } from './login.js'

const client = new Colyseus.Client()

setupLogin(async (id, name) => {
    
    const room = await client.joinOrCreate('game', { id, name })

    

    
})