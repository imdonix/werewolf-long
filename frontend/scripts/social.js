import { secondsToMinutesAndSeconds } from './utils.js'

export function Social(room)
{
    const socialPanel = document.getElementById('social-panel')

    const socialWatch = document.getElementById('social-watch')
    const socialWatchCountdown = document.getElementById('social-watch-countdown')
    const socialWatchAction = document.getElementById('social-watch-action')
    const socialWatchHints = document.getElementById('social-watch-hints')
    
    const socialAction = document.getElementById('social-action')
    const socialActionBack = document.getElementById('social-action-back')
    const socialActionRole = document.getElementById('social-action-role')

    function createHintDOM(index, text)
    {
        const container = document.createElement('div')
        container.innerHTML = `
        <div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">Tipp #${index}</h5>
          <p class="card-text">${text}</p>
        </div>
        </div>
        `
        return container
    }

    function toogleMode(watch)
    {
        if(watch)
        {
            socialWatch.classList.remove('disabled')
            socialAction.classList.add('disabled')
        }
        else
        {
            socialWatch.classList.add('disabled')
            socialAction.classList.remove('disabled')
        }
    }

    socialActionBack.addEventListener('click', () => toogleMode(true))
    socialWatchAction.addEventListener('click', () => toogleMode(false))
    toogleMode(true)

    
    room.onMessage('social_countdown', (sec) => {
        const res = secondsToMinutesAndSeconds(sec)
        socialWatchCountdown.innerText = `${res.minutes}:${res.seconds}`
    })

    room.hintDispacher.subscribe(() => {
        const hintArrayCoppy = [...room.state.readableHints.values()]
        socialWatchHints.innerHTML = ''
        for (let i = 0; i < 3; i++) 
        {
            const elem = hintArrayCoppy.pop()
            if(elem)
            {
                socialWatchHints.appendChild(createHintDOM(i+1, elem))
            }
        }   
    })

    room.playerDispacher.subscribe(() => {
        for (const player of room.state.players.values()) 
        {
            if(player.accountId == room.accountID)
            {

                if(player.gameSide == 'spectator')
                { socialActionRole.innerText = 'Megfigyelő' }
                else if(player.gameSide == 'werewolf')
                { socialActionRole.innerText = 'Vérfarkas' }
                else if(player.gameSide == 'human')
                { socialActionRole.innerText = 'Ember' }
                else
                { socialActionRole.innerText = '???' }
                 
            }
        }
    })

    return {
        show : () => {
            socialPanel.classList.remove('disabled')
        },

        hide : () => {
            socialPanel.classList.add('disabled')
        }
    }
}