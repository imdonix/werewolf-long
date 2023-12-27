import { readFile } from "fs/promises"
import { Delayed, Room, Client, logger } from "@colyseus/core"

import { GameState } from "./schema/GameState"

import { Stage } from "./stages/Stage"
import { Setup } from "./stages/Setup"

import { Player } from "./schema/Player";
import { Social } from "./stages/Social"
import { Hint } from "./Hint"
import { Vote } from "./stages/Vote"

export class Game extends Room<GameState> 
{
	public autoDispose : boolean = false
	public maxClients : number = 64

	public seed : number 
	public config : any
	public hints : Array<Hint>

	private setup : Setup = new Setup() 
	private social : Social = new Social()
	private vote : Vote = new Vote()
	private stages : Map<string, Stage>

	private updateInterval : Delayed

	async onCreate(options: any) 
	{
		this.config = JSON.parse((await readFile('./config.json')).toString())
		this.seed = options.seed || Math.floor(Math.random() * Math.pow(10, 6))
		this.setState(new GameState())

		
		this.stages = new Map()
		this.stages.set(this.setup.constructor.name, this.setup.init(this))
		this.stages.set(this.social.constructor.name, this.social.init(this))
		this.stages.set(this.vote.constructor.name, this.vote.init(this))

		this.updateInterval = this.clock.setInterval(this.update.bind(this), 1000)

		this.info('Game', `Room created`)
	}


	onJoin(client: Client, options: any) 
	{
		const id = options.id

		if(!id) return // if there is no id let user inspect for playground

		const findOld = this.state.players.get(id)
		if(findOld)
		{
			findOld.clients.push(client) // override the old client
			this.info('Game', `'${findOld.accountName}' returned [${findOld.clients.length}]`)
		}
		else
		{
			const player = new Player()
			player.clients = [client]
			player.accountName = options.name
			player.accountId = id

			this.state.players.set(player.accountId, player)
			this.info('Game' ,`'${player.accountName}' joined [${player.clients.length}]`)
		}
	}

	async onLeave(client: Client, consented: boolean) 
	{
		for (const player of this.state.players.values()) 
		{
			const i =player.clients.indexOf(client)
			if(i >= 0)
			{
				player.clients.splice(i, 1)
				if(player.clients.length == 0)
				{
					this.info('Game' ,`'${player.accountName}' went offline`)
				}
			}
		}
	}

	onDispose() 
	{
		this.updateInterval.clear()
		this.info('Game' ,`Disposed`)
	}


	previusStage : string
	private update()
	{
		if(this.previusStage != this.state.stage)
		{
			this.stages.get(this.state.stage).clear()
			this.previusStage = this.state.stage
		}

		this.stages.get(this.state.stage).update()
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

	shuffleArray<T>(array : Array<T>) 
    {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}
