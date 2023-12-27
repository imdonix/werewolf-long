import { Game } from "../Game";

export abstract class Stage 
{
	protected game : Game
	private started : boolean = false

	/* Init runs before the first Update */
	abstract onInit() : void

	/* Start runs insted of the first Update */
	abstract onStart() : void

	/* Update runs for every one secound */
	abstract onUpdate() : void


	init(game : Game) : Stage
	{
		this.game = game
		this.onInit()
		return this
	}

	update() : void
	{
		if(!this.started)
		{
			this.onStart()
			this.started = true
		}
		else
		{
			this.onUpdate()
		}
	}

	clear()
	{
		this.started = false
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

}