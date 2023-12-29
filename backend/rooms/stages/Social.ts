import { Client } from "colyseus";
import { Player } from "../schema/Player";
import { Stage } from "./Stage";

export class Social extends Stage
{

    skills : Map<Player, {skill : any, usedOn : Player}>
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
        const skills = new Array()
        for (const category of this.game.config.categories) 
        {
            if('skill' in category)
            {
                skills.push({
                    category : category,
                    name: category.skill,
                    action: category.skillAction,
                    response: category.skillResponse,
                })
            }
        }      

        let skillsCopy = new Array()

        for (const player of this.game.state.players.values()) 
        {

            if(skillsCopy.length == 0)
            {
                skillsCopy = [...skills]
                this.game.shuffleArray(skillsCopy)
            }

            
            if(player.alive)
            {
                this.skills.set(player, {
                    skill : skillsCopy.pop(),
                    usedOn : null
                })
            }
            else
            {
                const supported = this.game.state.players.get(player.supported)
                if(supported)
                {
                    this.skills.set(player, {
                        skill : {
                            name : this.game.config.roles.angel,
                            response : `<b>${supported.accountName}</b> <sup>(${this.game.config.roles[supported.gameSide]})</sup> őrangyala vagy, segítsd a játékban ahogy tudod.`
                        },
                        usedOn : supported
                    })
                }
                else
                {
                    this.skills.set(player, {
                        skill : null,
                        usedOn : null
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
                    this.warn(`hint is invalid (cat -> ${category}) (item -> ${item.id})`)
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
        const obj = this.skills.get(player)

        if(obj.usedOn)
        {
            let responseBuilder : string = obj.skill.response
            if(responseBuilder.indexOf('@') >= 0) responseBuilder = responseBuilder.replace('@', obj.usedOn.accountName)
            if(responseBuilder.indexOf('#') >= 0) 
            {
                const itemID = obj.usedOn.facts.get(obj.skill.category.id)
                for (const item of obj.skill.category.items) 
                {
                    if(item.id == itemID)
                    {
                        responseBuilder = responseBuilder.replace('#', item.sentence)
                    }
                }
            } 

            player.send('skillState', {
                category : obj.skill.name,
                description : responseBuilder,
                used : true
            })
        }
        else
        {
            player.send('skillState', {
                category : obj.skill.name,
                description : obj.skill.action,
                used : false
            })
        }
    }

    onSkillUse(client : Client, targetid : string)
    {
        const player = this.game.selectPlayer(client)
        const target = this.game.state.players.get(targetid)

        const skill = this.skills.get(player)
        if(!skill.usedOn)
        {
            skill.usedOn = target
            this.onSkillPreview(client, null)
        }
    }

}