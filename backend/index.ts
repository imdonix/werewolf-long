import { Server } from "colyseus"
import { createServer } from "http"
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground"
import express from "express"
import { static as expStatic } from "express";

import { Game } from "./rooms/Game";

const port = Number(process.env.port) || 8887

const app = express()
app.use(express.json())

const gameServer = new Server({
	server: createServer(app)
})

gameServer.define('game', Game)

console.log('✅ Master initialized')
app.use('/playground', playground)
app.use('/monitor', monitor())
app.use('', expStatic('frontend'))


gameServer.listen(port)
console.log(`http://localhost:${port}`)