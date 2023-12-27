import { Client } from "colyseus";
import { Player, Side } from "../schema/Player";
import { Stage } from "./Stage";
import { generateHints } from "../Hint";



export class Social extends Stage
{

    cooldown : number

    onInit(): void 
    {
    }

    onStart(): void 
    {
        this.info(`[${this.game.state.turn}] Social stage started...`)
        this.cooldown = this.game.config.socialStage

        // update hints
        for (let i = 0; i < 3; i++) 
        {
            const hint = this.game.hints.pop()

            if(hint)
            {
                let category = null
                for (const cat of this.game.config.categories) 
                {
                    if(cat.id == hint.category)
                    {
                        category = cat
                        break
                    }
                }
    
                let itemName = ''
                for (const item of category.items) 
                {
                    if(item.id == hint.item)
                    {
                        itemName = item.name
                    }
                }
                
                
                let text = this.game.config.hints[hint.type]
                text = text.replace('@', this.game.config.roles[hint.role.toString()]) 
                text = text.replace('#', category.sentence.replace('#', itemName))
                this.game.state.readableHints.push(text)

                this.info(`new hint -> ${text}`)
            }
            else
            {
                this.info(`there is no more hint to provide`)
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
            this.game.state.stage = 'Vote'
        }
    }

}