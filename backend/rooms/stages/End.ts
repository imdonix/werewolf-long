import { Stage } from "./Stage";



export class End extends Stage
{

    onInit(): void {}

    onStart(): void 
    {
        this.info(`[${this.game.state.turn}] game ended!`)
    }

    onUpdate(): void  {}

}