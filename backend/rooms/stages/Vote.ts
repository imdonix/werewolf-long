import { Client } from "colyseus";
import { Stage } from "./Stage";
import { Player, Side } from "../schema/Player";



export class Vote extends Stage
{


    votes : Map<Player, string>
    cooldown : number
    killed : [string, number]

    onInit(): void 
    {
        this.onMessage('vote', this.onVote.bind(this))
        this.onMessage('afterlife', this.onAfterlife.bind(this))
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
                for (const [player, voted] of this.votes.entries()) 
                {
                    if(counter.has(voted))
                    {
                        if(player.alive)
                        {
                            counter.set(voted, counter.get(voted) + 2)
                        }
                        else
                        {
                            counter.set(voted, counter.get(voted) + 1)
                        }
                    }
                    else
                    {
                        counter.set(voted, 1)
                    }
                }

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
                if(this.killed[0])
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
                            this.votes.set(player, message)
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
        const players = [...this.game.state.players.values()]
        if(players.length == this.votes.size)
        {
            this.cooldown = Math.min(this.cooldown, this.game.config.voteFinishedSkip)
            this.info(`time reduced`)
        }
    }

    end()
    {
        const alive = [...this.game.state.players.values()]
        const werewolfs = alive.filter(player => player.gameSide == Side.WEREWOLF && player.alive)
        const humans = alive.filter(player => player.gameSide == Side.HUMAN && player.alive)

        if(werewolfs.length > 0 && humans.length > 0)
        {
            this.game.state.stage = 'Social'
            this.game.state.turn++
            this.info(`end of vote (c)`)
        }
        else
        {
            this.game.state.stage = 'End'
            this.info(`end of vote (e)`)
        }
    }
}