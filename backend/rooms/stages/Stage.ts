import { Client } from "colyseus";
import { Game } from "../Game";

export abstract class Stage 
{
	private msgQueue : Map<string, { call : (client : Client, data : any) => void, queue : Array<any>}>

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
		this.msgQueue = new Map()
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
			this.dispachQueue()
			this.onUpdate()
		}
	}

	public onMessage(msg : string, callback : (client : Client, data : any) => void)
	{
		this.msgQueue.set(msg, {
			call : callback,
			queue : new Array()
		})
		this.game.onMessage(msg, (client, data) => this.msgQueue.get(msg).queue.push({client, data}))
	}

	private dispachQueue()
	{
		for (const queue of this.msgQueue.values()) 
		{
			let obj;
			while(obj = queue.queue.pop())
			{
				queue.call(obj.client, obj.data)
			}
		}
	}

	public clear()
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