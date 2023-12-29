import { Client } from "colyseus";
import { Player, Side } from "../schema/Player";
import { Stage } from "./Stage";
import { generateHints } from "../Hint";



export class Setup extends Stage
{

    cooldown : number

    onInit(): void 
    {
        this.onMessage('answer', this.onAnswer.bind(this))
    }

    onStart(): void 
    {
        this.info('Preparing game...')
        this.cooldown = this.game.config.setupCountdown
    }

    onUpdate(): void 
    {
        const players = [...this.game.state.players.values()]

        let done = true
        for (const player of players) 
        {
            let playerDone = true
            for (const category of this.game.config.categories) 
            {
                if(!player.facts.has(category.id))
                {
                    done = false
                    player.send('question', {
                        category : category.id,
                        text : category.question,
                        facts : category.items,
                    })
                    playerDone = false
                    break
                }
            }

            if(playerDone)
            {
                player.send('done')
                player.ready = true 
            }
        }


        if(done && players.length >= 2)
        {
            if(this.cooldown > 0)
            {
                this.cooldown--
                this.game.broadcast('setup_countdown', this.cooldown)
            }
            else
            {
                // shuffle players into teams
                const players = [...this.game.state.players.values()]
                const randArray = new Array(players.length).fill(null).map((_, i) => i)
                this.game.shuffleArray(randArray)

                for (let i = 0; i < players.length; i++) 
                {
                    if(this.game.config.werewolfThresholds.indexOf(i+1) >= 0)
                    {
                        players[randArray[i]].gameSide = Side.WEREWOLF
                    }
                    else
                    {
                        players[randArray[i]].gameSide = Side.HUMAN
                    }
                }

                // generate hints
                this.game.hints = generateHints(this.game.config.categories, [...this.game.state.players.values()], Side.WEREWOLF)
                this.game.shuffleArray(this.game.hints)
                
                this.game.state.stage = 'Social'
            }
        }
    }

    onAnswer(client : Client, answer : any)
    {
        const player = this.game.selectPlayer(client)
        player.facts.set(answer.category, answer.answer)
        this.game.info('Setup', `${player.accountName} answered '${answer.category}'`)
    }

}