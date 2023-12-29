export function Setup(room)
{
    const setupPanel = document.getElementById('setup-panel')

    const setupWaiting = document.getElementById('setup-waiting')
    const setupDisplay = document.getElementById('setup-display')
    
    const setupQuestion = document.getElementById('setup-question')
    const setupQuestionText = document.getElementById('setup-question-text')
    const setupQuestionContainer = document.getElementById('setup-question-container')
    const setupQuestionSubmit = document.getElementById('setup-question-submit')
    
    const setupCountdownPanel = document.getElementById('setup-countdown-panel')
    const setupCountdown = document.getElementById('setup-countdown')

    let lastCategory = null
    let lastHandler = null

    function updatePlayerReady(room)
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
        if(lastCategory == question.category) return // same question -> prevent rerendering
    
        // clear old question container and handler
        if(lastHandler) setupQuestionSubmit.removeEventListener('click', lastHandler)
        setupQuestionContainer.innerHTML = '' 
    
        // create question panel
        setupQuestionText.innerText = question.text
        const options = new Array()
        for (const fact of question.facts) 
        {
            const option = document.createElement('div')
            const input = document.createElement('input')
            const lable = document.createElement('label')
    
            option.classList.add('form-check')
            input.id = fact.id
            input.classList.add('form-check-input')
            input.type = 'radio'
            input.name = 'answers'
            lable.classList.add('form-check-label')
            lable.innerText = fact.name
            lable.htmlFor = fact.id
    
            option.appendChild(input)
            option.appendChild(lable)
            setupQuestionContainer.appendChild(option)
    
            options.push(input)
            
        }
    
        lastHandler = () => {
    
            let answ = null
            for (const opt of options) 
            {
                if(opt.checked)
                {
                    answ = opt.id
                }
            }
    
            if(answ)
            {
                room.send('answer', {
                    category : question.category,
                    answer : answ
                })
    
                setupQuestion.classList.add('disabled')
            }
            else
            {
                console.log('No answer selected')
            }
        }
    
        setupQuestionSubmit.addEventListener('click', lastHandler)
        setupQuestion.classList.remove('disabled')
        lastCategory = question.category
        console.log(`Qustion recieved: ${lastCategory}`)
    }

    // setup player ready display
    room.playerDispacher.subscribe((player) => updatePlayerReady(room))

    // question handlers
    room.onMessage('question', (question) => displayQuestion(room, question))
    room.onMessage('done', () => { setupWaiting.classList.remove('disabled') })
    room.onMessage('setup_countdown', (rem) => {
        setupCountdownPanel.classList.remove('disabled')
        setupCountdown.innerText = rem
    })

    return {
        show : () => {
            setupPanel.classList.remove('disabled')
        },

        hide : () => {
            setupPanel.classList.add('disabled')
        }
    }
}