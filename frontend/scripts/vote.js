import { secondsToMinutesAndSeconds } from './utils.js'

export function Vote(room)
{

    const votePanel = document.getElementById('vote-panel')

    const voteAction = document.getElementById('vote-action')
    const voteCountdown = document.getElementById('vote-countdown')
    const voteNames = document.getElementById('vote-names') 
    
    const voteEnd = document.getElementById('vote-end')
    const voteEndName = document.getElementById('vote-end-name')
    const voteEndCount = document.getElementById('vote-end-count')
    
    const voteLose = document.getElementById('vote-lose')
    const voteSideWerewolf = document.getElementById('vote-side-werewolf')
    const voteSideHuman = document.getElementById('vote-side-human')

    function createVoteDOM(player, handler)
    {
    
        const elem = document.createElement('a')
        const card = document.createElement('div')
        elem.addEventListener('click', handler)
        elem.href = '#'
        elem.style.textDecoration = 'none'
        elem.id = player.accountId
        card.classList.add('card', 'mb-2')
        card.innerHTML = `
        <div class="card-body">
          <h5 class="card-text text-center">${player.accountName}</h5>
        </div>
        `
        elem.appendChild(card)
    
        return [elem, card]
    }

    room.onMessage('vote_countdown', (sec) => {
        const res = secondsToMinutesAndSeconds(sec)
        voteCountdown.innerText = `${res.minutes}:${res.seconds}`
    })

    room.onMessage('killed', (response) => {
        
        // adjust panels
        voteAction.classList.add('disabled')
        voteEnd.classList.remove('disabled')

        // display names
        voteEndName.innerText = room.state.players.get(response.killed).accountName
        voteEndCount.innerText = `${response.votes}`


        // enable side chosser for loser
        if(room.accountID == response.killed)
        {
            voteLose.classList.remove('disabled')
        }
    })

    let cards;
    function render()
    {
        // reset vote cards
        cards = new Array()
        voteNames.innerHTML = ``

        // check that current player is alive
        for (const player of room.state.players.values()) 
        {
            if(room.accountID == player.accountID)
            {
                if(!player.alive)
                {
                    voteNames.innerHTML = `<h2>Meghaltál</h2><h4>Nem tudsz szavazni</h4>`
                    return
                }
            }
        }

        // generate vote cards
        for (const player of room.state.players.values()) 
        {
            if(player.alive)
            {
                const elems = createVoteDOM(player, () => {
                    const local = player
                    select(local)
                })
                voteNames.appendChild(elems[0])
                cards.push(elems)
            }
        }
    }

    function select(player)
    {
        for (const [elem, card] of cards) 
        {
            if(elem.id == player.accountId)
            {
                card.classList.add('text-white', 'bg-dark')
            }
            else
            {
                card.classList.remove('text-white', 'bg-dark')
            }
        }

        room.send('vote', player.accountId)
    }


    voteSideWerewolf.addEventListener('click', () => {
        room.send('afterlife', 'werewolf')
    })

    voteSideHuman.addEventListener('click', () => {
        room.send('afterlife', 'human')
    })

    return {
        show : () => {
            votePanel.classList.remove('disabled')
            voteAction.classList.remove('disabled')
            voteEnd.classList.add('disabled')
            voteLose.classList.add('disabled')
            render()
        },

        hide : () => {
            votePanel.classList.add('disabled')
        }
    }
}