import { setupLogin } from './login.js'

const client = new Colyseus.Client()

setupLogin(async (id, name) => {
    
    await client.joinOrCreate('game', { id, name })
})