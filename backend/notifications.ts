import webpush  from "web-push"
import { Router } from "express"

export const subscriptions = new Map()

export function NotificationRouter(pubkey : string, prvkey : string) 
{
    const router = Router()

    if(pubkey && prvkey)
    {
        webpush.setVapidDetails("mailto:redlogic@donix.dev", pubkey, prvkey);

        router.get('/pubkey', (req, res) => {
            res.send({
                key : pubkey
            })
        })
    
        router.post('/subscribe', (req, res) => {
            const id = req.body.id
            const subscription = req.body.subscription
    
            subscriptions.set(id, subscription)
    
            res.status(201).json({})
            console.log(`${id} subscribed for notifications`)
    
            //(() => webpush.sendNotification(subscription, payload).catch(console.log))
        })
    }
    else
    {
        console.error(`!!! 'pubkey' & 'prvkey' must be provided to use push notifications`)
    }

    return router
} 

