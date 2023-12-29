export function End(room)
{

    const endPanel = document.getElementById('end-panel')

    return {
        show : () => {
            endPanel.classList.remove('disabled')
        },

        hide : () => {
            endPanel.classList.add('disabled')
        }
    }
}