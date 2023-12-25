import { Player } from "../schema/Player";
import { Stage } from "./Stage";



export class Setup extends Stage
{

    cooldown : number

    onInit(): void {}

    onStart(): void 
    {
        this.info('Preparing game...')

        this.game.state.players.onAdd()
    }

    async onStartAsync() 
    {
        //Nothing to do here   
    }

    onUpdate(): void 
    {
    }

    onPlayerJoin(player: Player): void {
        
    }
}