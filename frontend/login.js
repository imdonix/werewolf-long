const loginPanel = document.getElementById('login-panel')
const loginName = document.getElementById('login-name')
const loginSubmit = document.getElementById('login-submit')

const id = loadUniqueID()

function loadUniqueID()
{
    let cache = localStorage.getItem('id')
    if(cache)
    {
        return cache
    }

    cache = self.crypto.randomUUID()
    localStorage.setItem('id', cache)
    return cache
}

export function setupLogin(ready)
{
    loginPanel.classList.remove('disabled')

    const login = () =>{

        let cache = localStorage.getItem('name')
        if(!cache)
        {
            const input = loginName.value
            if(input.length > 3)
            {
                cache = input
                localStorage.setItem('name', cache)   
            }
        }

        ready(id, cache)
        .then(() => console.log('Auth ok.'))
        .catch((err) => console.error(err))
    }

    loginSubmit.addEventListener('click', login)
    login()
}