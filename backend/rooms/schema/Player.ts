import { Schema, type } from "@colyseus/schema"
import { Client } from "colyseus"

export enum Side
{
	SPECTATOR = 0,
	WEREWOLF = 1,
	HUMAN = 2
}

export class Player extends Schema 
{
	clients : Array<Client>

	@type('string') accountId: string
	@type('string') accountName: string
	
	@type('boolean') ready : boolean = false
	@type('boolean') alive : boolean = true
	@type('uint8') gameSide : Side = Side.SPECTATOR

	facts : Map<string, string> = new Map() // CategoryID -> Fact 

}