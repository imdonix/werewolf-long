import { gameSideToReadable } from "./utils.js";

export function End(room)
{

    const endPanel = document.getElementById('end-panel')

    const endWinner = document.getElementById('end-winner')
    const endTable = document.getElementById('end-table')

    function createRecordDOM(name, role, alive, supported)
    {
        const row = document.createElement('tr')
        row.innerHTML = `
        <td>${name}</td>
        <td>${role}</td>
        <td>${alive ? '❤️' : '💔'}</td>
        <td>${supported ? '' : '-'}</td>
        `
        return row
    }

    function renderList()
    {
        endTable.innerHTML = ``
        for (const player of room.state.players.values()) 
        {
            const supportedName = room.state.players.get(player.supported)?.accountName
            endTable.appendChild(createRecordDOM(player.accountName, gameSideToReadable(player.gameSide), player.alive, supportedName))
        }

        endWinner.innerHTML = gameSideToReadable(room.state.won)
    }
    
    return {
        show : () => {
            endPanel.classList.remove('disabled')
            renderList()
        },

        hide : () => {
            endPanel.classList.remove('disabled')
            renderList()
        }
    }
}