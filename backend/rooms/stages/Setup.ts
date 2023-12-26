import { Client } from "colyseus";
import { Player } from "../schema/Player";
import { Stage } from "./Stage";



export class Setup extends Stage
{

    cooldown : number

    onInit(): void 
    {
        this.game.onMessage('answer', this.onAnswer.bind(this))
    }

    onStart(): void 
    {
        this.info('Preparing game...')
        this.cooldown = this.game.config.setupCountdown
    }

    onUpdate(): void 
    {
        let done = true
        for (const player of this.game.state.players.values()) 
        {
            let playerDone = true
            for (const category of this.game.config.categories) 
            {
                if(!player.facts.has(category.id))
                {
                    done = false
                    for (const client of player.clients) 
                    {
                        client.send('question', {
                            category : category.id,
                            text : category.question,
                            facts : category.items,
                        })
                    }
                    playerDone = false
                    break
                }
            }

            if(playerDone)
            {
                for (const client of player.clients) 
                {
                    client.send('done')
                }

                player.ready = true 
            }
        }


        if(done)
        {

        }
    }

    onAnswer(client : Client, answer : any)
    {
        for (const player of this.game.state.players.values()) 
        {
            for(const opt of player.clients)
            {
                if(client == opt)
                {
                    player.facts.set(answer.category, answer.answer)
                    this.game.info('Setup', `${player.accountName} answered '${answer.category}'`)
                    return
                }
            }
        }

    }
}