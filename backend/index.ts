import config from "@colyseus/tools";
import { listen } from "@colyseus/tools"
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { static as expStatic } from "express";

import { Game } from "./rooms/Game";

listen(config({

	initializeGameServer: (gameServer) => {

		gameServer.define('game', Game)
	},

	initializeExpress: async (app) => {

		console.log('✅ Master initialized')

		app.use('', expStatic('public'))
		app.use('', expStatic('frontend'))
		
		app.use('/playground', playground)
		app.use('/monitor', monitor())
	},

}))
