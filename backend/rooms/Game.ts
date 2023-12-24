import { Delayed, Room, Client, logger } from "@colyseus/core"

import { GameState } from "./schema/GameState"

import { Stage } from "./stages/Stage"
import { Init } from "./stages/Init"

import { Player } from "./schema/Player";



export class Game extends Room<GameState> 
{
	public maxClients : number = 2
	public mode : string

	public seed : number 

	private init : Init = new Init() 
	private stages : Array<Stage> = [this.init]

	private updateInterval : Delayed
	public leavers : Set<string>

	async onCreate(options: any) 
	{
		this.mode = options.mode

		this.leavers = new Set()
		this.seed = options.seed || Math.floor(Math.random() * Math.pow(10, 6))
		this.setState(new GameState())

		this.init.init(this)
		
		this.updateInterval = this.clock.setInterval(this.update.bind(this), 1000)

		this.info('Game', `Room created [${this.mode}]`)
	}


	onJoin(client: Client, options: any) 
	{
        const player = new Player()
        player.client = client
        player.accountName = options.name
		player.accountId = options.id
        this.state.players.set(client.sessionId, player)

		this.info('Game' ,`'${player.accountName}' joined room '${this.roomId}'`)
		this.stages[this.state.stage].onPlayerJoin(player)
	}

	async onLeave(client: Client, consented: boolean) 
	{
		const player = this.state.players.get(client.sessionId)
  
		if(consented)
		{
			this.info('Game' ,`'${player.accountName}' left the room`)
			this.state.players.delete(client.sessionId)
			this.stages[this.state.stage].onPlayerLeave(player)
		}
		else
		{
			this.info('Game' ,`'${player.accountName}' reconnecting...`)

			try 
			{
				await this.allowReconnection(client, 60)
				this.info('Game' ,`'${player.accountName}' returned!`)			
			} 
			catch (e) 
			{
				this.info('Game' ,`'${player.accountName}' timeouted!`)
				this.state.players.delete(client.sessionId)
				this.stages[this.state.stage].onPlayerLeave(player)
			}
		}
	}

	onDispose() 
	{
		this.updateInterval.clear()
		this.info('Game' ,`Disposed`)
	}


	private update()
	{
		this.stages[this.state.stage].update()
	}

	public getPlayerByAccountID(accountID : string) : Player
	{
		for (const player of this.state.players.values()) 
		{
			if(player.accountId == accountID)
			{
				return player
			}
		}

		throw new Error('Player not found with account id: ' + accountID)
	}

	public getStages()
	{
		return this.stages
	}

	public info(sub : string, message : any)
	{
		logger.info(`{${this.roomId}} [${sub}] ${message}`)
	}

	public warn(sub : string, message : any)
	{
		logger.warn(`{${this.roomId}} [${sub}] ${message}`)
	}
}
