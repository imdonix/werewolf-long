export async function Webpush(id)
{
    try
    {
        if('serviceWorker' in navigator) 
        {   
            const register = await navigator.serviceWorker.register('./worker.js', { scope: '/' })
    
            console.log('service worker registered.')
        
            const res = await fetch('/notification/pubkey')
            const obj = await res.json()
    
            console.log(`public key recieved -> ${obj.key}`)
    
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: obj.key,
            })
    
            const request = {
                subscription,
                id
            }
        
            await fetch("/notification/subscribe", {
                method: "POST",
                body: JSON.stringify(request),
                headers: {
                    "Content-Type": "application/json",
                }
            })
    
            console.log('subscribed to notifications.')

            return true
        }
    }
    
    catch(error)
    {
        return false
    }
}