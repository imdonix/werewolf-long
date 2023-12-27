import { Client } from "colyseus";
import { Stage } from "./Stage";
import { Side } from "../schema/Player";



export class Vote extends Stage
{


    votes : Map<string, string>
    cooldown : number
    killed : [string, number]

    onInit(): void 
    {
        this.game.onMessage('vote', this.onVote.bind(this))
        this.game.onMessage('afterlife', this.onAfterlife.bind(this))
    }

    onStart(): void 
    {
        this.info(`[${this.game.state.turn}] Vote started...`)
        this.cooldown = this.game.config.voteStage
        this.killed = null
        this.votes = new Map()
    }


    onUpdate(): void 
    {
        if(this.cooldown > 0)
        {
            this.cooldown--
            for (const player of this.game.state.players.values()) 
            {
                for (const client of player.clients) 
                {
                    client.send('vote_countdown', this.cooldown)
                }
            }
        }
        else
        {
            // kill the most voted player
            if(!this.killed)
            {
                const counter = new Map<string, number>()

                // add votes
                for (const voted of this.votes.values()) 
                {
                    if(counter.has(voted))
                    {
                        counter.set(voted, counter.get(voted) + 1)
                    }
                    else
                    {
                        counter.set(voted, 1)
                    }
                }

                // remove guardian angel votes
                // TODO


                // find most voted
                let voted = null
                let max = 0
                for (const [id, num] of counter.entries()) 
                {
                    if(num > max)
                    {
                        voted = id
                        max = num
                    }
                }

                this.killed = [voted, max]
                if(this.killed)
                {
                    this.game.state.players.get(this.killed[0]).alive = false
                }

                this.info(`${this.game.state.players.get(voted)?.accountName} killed in this turn`)
            }

            for (const player of this.game.state.players.values()) 
            {
                for (const client of player.clients) 
                {
                    client.send('killed', {
                        killed : this.killed[0],
                        votes : this.killed[1]
                    })
                }
            }
        }
    }

    onVote(client : Client, message : string)
    {
        for (const player of this.game.state.players.values()) 
        {
            for (const cli of player.clients) 
            {
                if(cli == client)
                {
                    const voted = this.game.state.players.get(message)
                    if(voted)
                    {
                        if(voted.alive)
                        {
                            this.votes.set(player.accountId, message)
                            this.info(`${player.accountName} voted for player '${message}'`)
                            this.tryReduceTime()
                        }
                        else
                        {
                            this.warn(`${player.accountName} voted dead player '${message}'`)
                        }
                    }
                    else
                    {
                        this.warn(`${player.accountName} voted invalid player '${message}'`)
                    }
                    return
                }
            }    
        }
    }

    onAfterlife(client : Client, side : Side)
    {
        for (const player of this.game.state.players.values()) 
        {
            for (const cli of player.clients) 
            {
                if(cli == client)
                {
                    // set player afterlife
                    player.afterlife = side
                    this.info(`${player.accountName} picked '${side}'`)
                    
                    // end turn
                    this.end()
                    return
                }
            }
        }
    }

    tryReduceTime()
    {
        const alive = [...this.game.state.players.values()].filter(player => player.alive)
        if(alive.length == this.votes.size)
        {
            this.cooldown = Math.min(this.cooldown, this.game.config.voteFinishedSkip)
            this.info(`time reduced`)
        }
    }

    end()
    {
        this.game.state.stage = 'Social'
        this.game.state.turn++
        this.info(`end of vote`)
    }
}