import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";

export class GameState extends Schema 
{
	/*
		0 = Lobby
		1 = Init
		2 = Spread
		3 = Conquer
		4 = End
	*/
	@type( 'uint8' ) stage : number = 0

	/*
		Counter for stages
	*/
	@type( 'uint8' ) turn : number = 0

	/*
		Key: Client session ID
	*/
	@type({ map: Player }) players = new MapSchema<Player>()

}
