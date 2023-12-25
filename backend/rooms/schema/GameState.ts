import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";

export class GameState extends Schema 
{

	@type( 'string' ) stage : string = 'Setup'

	/*
		Counter for stages
	*/
	@type( 'uint8' ) turn : number = 0

	/*
		Key: Client session ID
	*/
	@type({ map: Player }) players = new MapSchema<Player>()

}
