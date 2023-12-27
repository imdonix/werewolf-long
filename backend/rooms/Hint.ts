import { Player, Side } from "./schema/Player";

export interface Hint {
    type : string
    category : string,
    item : string
    strenght : number
    role : Side
}

export function generateHints(categories : any, players : Array<Player>, role : Side) : Array<Hint>
{
    const collector = new Array()
    collector.push(...trueFor(categories, players, role))
    return collector
}



function trueFor(categories : any, players : Array<Player>, role : Side) : Array<Hint>
{
    const tmp = new Array<Hint>()

    const filtered = players.filter(p => p.gameSide == role)
    for (const category of categories) 
    {
        for (const item of category.items) 
        {
            let found = new Array()
            for (const player of filtered) 
            {
                const fact = player.facts.get(category.id)
                if(fact == item.id)
                {
                    found.push(player)
                }
            }
            
            if(filtered.length == found.length)
            {
                tmp.push({
                    type : "trueForAll",
                    category : category.id,
                    item : item.id,
                    strenght : 10,
                    role : role
                })
            }
            if(found.length == 1)
            {
                tmp.push({
                    type : "trueForOnlyOne",
                    category : category.id,
                    item : item.id,
                    strenght : 5,
                    role : role
                })  
            }
            if(found.length > 0)
            {
                tmp.push({
                    type : "trueForAtleastOne",
                    category : category.id,
                    item : item.id,
                    strenght : 4,
                    role : role
                })  
            }
            if(found.length == 0)
            {
                tmp.push({
                    type : "thereIsNoOne",
                    category : category.id,
                    item : item.id,
                    strenght : 3,
                    role : role
                })  
            }
        }
    }

    return tmp
}