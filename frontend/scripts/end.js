import { gameSideToReadable } from "./utils.js";

export function End(room)
{

    const endPanel = document.getElementById('end-panel')

    const endWinner = document.getElementById('end-winner')
    const endTable = document.getElementById('end-table')

    function createRecordDOM(name, role, alive, supported, winner)
    {
        const row = document.createElement('tr')

        if(winner)
        {
            row.classList.add('table-success')
        }

        row.innerHTML = `
        <td>${name}</td>
        <td>${role}</td>
        <td>${alive ? '❤️' : '💀'}</td>
        <td>${supported ? supported : '-'}</td>
        `
        return row
    }

    function renderList()
    {
        endTable.innerHTML = ``

        endWinner.innerHTML = gameSideToReadable(room.state.won)
        for (const player of room.state.players.values()) 
        {
            endTable.appendChild(createRecordDOM(
                player.accountName, 
                gameSideToReadable(player.gameSide), 
                player.alive, 
                gameSideToReadable(player.afterlife), 
                room.state.won == player.afterlife))
        }

    }
    
    // rerender if state if not pached until this point
    room.playerDispacher.subscribe((player) => renderList())
    
    return {
        show : () => {
            endPanel.classList.remove('disabled')
            renderList()
        },

        hide : () => {
            endPanel.classList.add('disabled')
        }
    }
}