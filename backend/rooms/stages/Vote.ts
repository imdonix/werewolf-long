import webpush from "web-push"

import { Client } from "colyseus";
import { Stage } from "./Stage";
import { Player, Side } from "../schema/Player";
import { subscriptions } from "../../notifications";


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

        this.notifyUsers()
    }


    onUpdate(): void 
    {
        if(this.cooldown > 0)
        {
            this.cooldown--
            this.game.broadcast('vote_countdown', this.cooldown)
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

            this.game.broadcast('killed', {
                killed : this.killed[0],
                votes : this.killed[1]
            })
        }
    }

    onVote(client : Client, message : string)
    {
        const player = this.game.selectPlayer(client)

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
    }

    onAfterlife(client : Client, side : Side)
    {
        const player = this.game.selectPlayer(client)

        // set player afterlife
        player.afterlife = side
        this.info(`${player.accountName} picked '${side}'`)

        const players =  [...this.game.state.players.values()]
        const sidedGroup = players.filter(p => p.alive && p.gameSide == player.afterlife)

        if(sidedGroup.length > 0)
        {
            this.game.shuffleArray(sidedGroup)
            const supported = sidedGroup.pop()
            player.supported = supported.accountId
            this.info(`'${player.accountName}' will support '${supported.accountName}'(${side})`)
        }
        else
        {
            this.info(`for '${player.accountName}' there is no one alive in the sided group '${side}'`)
        }

        // end turn
        this.end()
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
            if(werewolfs.length > 0)
            {
                this.game.state.won = Side.WEREWOLF
                this.info(`end of vote (e -> werewolf)`)
            }
            else
            {
                this.game.state.won = Side.HUMAN
                this.info(`end of vote (e -> human)`)
            }

            this.game.state.stage = 'End'
            
        }
    }

    notifyUsers()
    {
        for (const player of this.game.state.players.values()) 
        {
            const subscription = subscriptions.get(player.accountId)
            if(subscription)
            {
                webpush.sendNotification(subscription, JSON.stringify({ title: this.game.config.voteNotification.replace('#', this.game.state.turn + 1)}))
            }   
            else
            {
                this.info(`'${player.accountName}' not enabled the notifications`)
            }
        }        
    }
}