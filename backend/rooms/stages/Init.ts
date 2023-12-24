import { Player } from "../schema/Player";
import { Stage } from "./Stage";



export class Init extends Stage
{

    cooldown : number

    onInit(): void {}

    onStart(): void 
    {
        this.info('Preparing game...')
    }

    async onStartAsync() 
    {
        //Nothing to do here   
    }

    onUpdate(): void 
    {
        if (this.cooldown > 0)
        {
            this.cooldown--
        }
        else
        {
            this.info('Game started.')
        }
    }

    onPlayerLeave(player: Player): void 
    {
        this.generalLeaveHandler(player)
    }
}