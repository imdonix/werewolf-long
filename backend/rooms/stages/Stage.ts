import { Game } from "../Game";
import { Player } from "../schema/Player";

export class StageInactiveError extends Error {}

export abstract class Stage 
{
	protected game : Game
	private started : boolean = false

	/* Init runs before the first Update */
	abstract onInit() : void

	/* Start runs insted of the first Update */
	abstract onStart() : void

	/* Start async will run after start */
	abstract onStartAsync() : Promise<void>

	/* Update runs for every one secound */
	abstract onUpdate() : void

    onPlayerJoin(player : Player) {}


	init(game : Game) : void
	{
		this.game = game
		this.onInit()
	}

	update() : void
	{
		if(!this.started)
		{
			this.onStart()
			this.onStartAsync()
			.catch(err => {
				if (err instanceof StageInactiveError) { /* OK: Expected error during player leave */ } 
				else 
				{
					this.warn('Game closed due to exception on stage logic')
					this.game.disconnect(5000)
				}
			})
			this.started = true
		}
		else
		{
			this.onUpdate()
		}
	}

	public isActive()
	{
		return this.constructor.name == this.game.state.stage
	}

	protected info(log : any) : void
	{
		this.game.info(this.constructor.name, log)
	}
	
	protected warn(log : any) : void
	{
		this.game.warn(this.constructor.name, log)
	}

	protected wait(sec : number) : Promise<void>
	{
		return new Promise((res, rej) => {
			this.game.clock.setTimeout(() => {
				if(this.isActive())
				{
					res()
				}
				else
				{
					rej(new StageInactiveError())
				}
				
			}, sec * 1000)
		})
	}

}