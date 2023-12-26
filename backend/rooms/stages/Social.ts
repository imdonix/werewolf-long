import { Client } from "colyseus";
import { Player, Side } from "../schema/Player";
import { Stage } from "./Stage";



export class Social extends Stage
{

    cooldown : number

    onInit(): void 
    {
    }

    onStart(): void 
    {
        this.info('Preparing game...')
        this.cooldown = this.game.config.socialStage

        // shuffle players into teams
        const players = [...this.game.state.players.values()]
        const randArray = new Array(players.length).fill(null).map((_, i) => i)
        this.shuffleArray(randArray)

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
                        client.send('social_countdown', this.cooldown)
                    }
                }
            }
            else
            {
                this.game.state.stage = 'Social'
            }
    }

    shuffleArray(array : Array<number>) 
    {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

}