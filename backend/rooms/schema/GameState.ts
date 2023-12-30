import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { Player } from "./Player";

export class GameState extends Schema 
{

	@type( 'string' ) stage : string = 'Setup'

	@type( 'uint8' ) turn : number = 0

	@type( 'string' ) won : string

	@type({ map: Player }) players = new MapSchema<Player>()

	@type({ array : 'string' }) readableHints = new ArraySchema<string>()

}
