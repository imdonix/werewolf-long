const setupPanel = document.getElementById('setup-panel')

const setupWaiting = document.getElementById('setup-waiting')
const setupDisplay = document.getElementById('setup-display')

const setupQuestion = document.getElementById('setup-question')
const setupQuestionText = document.getElementById('setup-question-text')
const setupQuestionSubmit = document.getElementById('setup-question-submit')

function updatePlayerReady()
{
    let count = 0;
    let ready = 0;  
    for (const player of room.state.players.values()) 
    {
        count++
        if(player.ready)
        {
            ready++
        }
    } 

    setupDisplay.innerText = `${count} / ${ready}`
}

function displayQuestion(room, question)
{

    setupQuestionText.innerText = question.text

    ```
    <div class="form-check">
    <input id="credit" name="paymentMethod" type="radio" class="form-check-input" checked="" required="">
    <label class="form-check-label" for="credit">Pizza</label>
    </div>
    ```

}

export function Setup(room)
{

    // setup player ready display
    room.state.players.onAdd((player, key) => updatePlayerReady(player))
    for (const player of room.state.players.values()) 
    {
        player.onChange(updatePlayerReady)
    }

    // question handlers
    room.onMessage('question', (question) => displayQuestion(room, question))

    return {
        show : () => {
            setupWaiting.classList.remove('disabled')
            setupPanel.classList.remove('disabled')
            setupQuestion.classList.add('disabled')
        },

        hide : () => {
            setupWaiting.classList.add('disabled')
            setupPanel.classList.add('disabled')
            setupQuestion.classList.add('disabled')
        }
    }
}