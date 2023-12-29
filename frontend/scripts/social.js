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
    const socialActionSide = document.getElementById('social-action-side')
    const socialActionLoading = document.getElementById('social-action-loading')
    const socialActionRole = document.getElementById('social-action-role')
    const socialActionDescription = document.getElementById('social-action-description')
    const socialActionUse = document.getElementById('social-action-use')
    const socialActionUseSelect = document.getElementById('social-action-use-select')
    const socialActionUseSend = document.getElementById('social-action-use-send')

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

    function requestActionPreview()
    {
        socialActionLoading.classList.remove('disabled')
        socialActionRole.classList.add('disabled')
        socialActionDescription.classList.add('disabled')

        room.send('skillPreview')
    }

    function responseActionPreview(res)
    {
        socialActionLoading.classList.add('disabled')
        socialActionRole.classList.remove('disabled')
        socialActionDescription.classList.remove('disabled')

        console.log(res)
        //{category : string, description : string, used : boolean}
        if(res.category)
        {
            socialActionRole.innerHTML = res.category
            socialActionDescription.innerHTML = res.description

            if(res.used)
            {
                socialActionUse.classList.add('disabled')
            }
            else
            {
                socialActionUse.classList.remove('disabled')

                let options = new Array()
                for (const player of room.state.players.values()) 
                {
                    if(player.alive)
                    {
                        options.push(`<option value="${player.accountId}">${player.accountName}</option>`)
                    }
                }

                socialActionUseSelect.innerHTML = options.join('\n')
            }
        }
        else
        {
            socialActionRole.innerHTML = `Őrangyal`
            socialActionDescription.innerHTML = res.description
        }
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
    socialWatchAction.addEventListener('click', () => { toogleMode(false); requestActionPreview() })
    toogleMode(true)

    
    room.onMessage('social_countdown', (sec) => {
        const res = secondsToMinutesAndSeconds(sec)
        socialWatchCountdown.innerText = `${res.minutes}:${res.seconds}`
    })

    room.onMessage('skillState', responseActionPreview)

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

        const player = room.state.players.get(room.accountID)

        if(player.gameSide == 'spectator')
        { socialActionSide.innerText = 'Megfigyelő' }
        else if(player.gameSide == 'werewolf')
        { socialActionSide.innerText = 'Vérfarkas' }
        else if(player.gameSide == 'human')
        { socialActionSide.innerText = 'Ember' }
        else
        { socialActionSide.innerText = '???' }
    })

    socialActionUseSend.addEventListener('click', () => {
        const id = socialActionUseSelect.value

        if(id)
        {
            console.log(`skill used on ${id}`)
            room.send('skillUse', id)
            requestActionPreview()
        }
    })

    return {
        show : () => {
            socialPanel.classList.remove('disabled')
            requestActionPreview()
        },

        hide : () => {
            socialPanel.classList.add('disabled')
        }
    }
}