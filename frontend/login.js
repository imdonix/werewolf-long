const loginPanel = document.getElementById('login-panel')
const loginName = document.getElementById('login-name')
const loginSubmit = document.getElementById('login-submit')
const loginError = document.getElementById('login-error')

const id = loadUniqueID()

function loadUniqueID()
{
    let cache = localStorage.getItem('id')
    if(cache)
    {
        return cache
    }

    cache = generateUUID()
    localStorage.setItem('id', cache)
    return cache
}

export function setupLogin(ready)
{
    loginPanel.classList.add('disabled')

    const onSuccess = () => {
        console.log(`Auth ok -> ${id}`)
        loginPanel.classList.add('disabled')
    }

    const onError = (err) => {
        loginPanel.classList.remove('disabled')
        loginError.innerText = err.toString()
    }

    const login = (event) =>{

        let cache = localStorage.getItem('name')

        if(cache)
        {
            ready(id, cache)
            .then(onSuccess)
            .catch(onError)
            return
        }

        const input = loginName.value
        if(input.length > 3)
        {
            localStorage.setItem('name', input)
            
            ready(id, cache)
            .then(onSuccess)
            .catch(onError)
        }
        else
        {
            if(event == 'init')
            {
                loginPanel.classList.remove('disabled')
            }
            else
            {
                onError('Túl rövid név')
            }
        }
        
    }

    loginSubmit.addEventListener('click', login)
    login('init')
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}