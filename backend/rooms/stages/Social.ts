import { Client } from "colyseus";
import { Player } from "../schema/Player";
import { Stage } from "./Stage";

export class Social extends Stage
{

    skills : Map<Player, {category : string, description : string, used : boolean}>
    cooldown : number


    onInit(): void 
    {
        this.onMessage('skillPreview', this.onSkillPreview.bind(this))
        this.onMessage('skillUse', this.onSkillUse.bind(this))
    }

    onStart(): void 
    {
        this.info(`[${this.game.state.turn}] Social stage started...`)
        this.cooldown = this.game.config.socialStage
        this.skills = new Map()

        this.prepareRoles()
        this.provideHints()
    }

    onUpdate(): void 
    {
        if(this.cooldown > 0)
        {
            this.cooldown--
            this.game.broadcast('social_countdown', this.cooldown)
        }
        else
        {
            this.game.state.stage = 'Vote'
        }
    }

    prepareRoles()
    {
        for (const player of this.game.state.players.values()) 
        {
            
            if(player.alive)
            {
                //TODO
                this.skills.set(player, {
                    category : 'none',
                    description : 'none',
                    used : true
                })
            }
            else
            {
                console.log(player.supported)
                const supported = this.game.state.players.get(player.supported)
                if(supported)
                {
                    this.skills.set(player, {
                        category : null, // angel
                        description : `<b>${supported.accountName}</b> <sup>(${this.game.config.roles[supported.gameSide]})</sup> őrangyala vagy, segítsd a játékban ahogy tudod.`,
                        used : true
                    })
                }
                else
                {
                    this.skills.set(player, {
                        category : null, // angel
                        description : null,
                        used : true
                    }) 
                }
            }
        }
        
    }

    provideHints()
    {
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
    
                let item = null
                for (const it of category.items) 
                {
                    if(it.id == hint.item)
                    {
                        item = it
                    }
                }
                
                if(category && item)
                {
                    let text = this.game.config.hints[hint.type]
                    text = text.replace('@', this.game.config.roles[hint.role.toString()]) 
                    text = text.replace('#', item.sentence)

                    this.game.state.readableHints.push(text)
                    this.info(`new hint -> ${text}`)
                }
                else
                {
                    this.warn(`hint is invalid (cat -> ${category}) (item -> ${itemName})`)
                }
            }
            else
            {
                this.info(`there is no more hint to provide`)
            }
        
        }
    }

    onSkillPreview(client : Client, _ : any)
    {
        const player = this.game.selectPlayer(client)
        player.send('skillState', this.skills.get(player))
    }

    onSkillUse(client : Client, target : any)
    {

    }

}