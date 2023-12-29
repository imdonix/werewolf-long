export function Login()
{
    const loginPanel = document.getElementById('login-panel')
    const loginName = document.getElementById('login-name')
    const loginSubmit = document.getElementById('login-submit')
    const loginError = document.getElementById('login-error')


    return new Promise((res, _) => {
        loginPanel.classList.add('disabled')

        const login = (event) =>{

            let id = loadUniqueID()
            let name = localStorage.getItem('name')
            // startup
            if(event == 'init')
            {
                if(id && name)
                {
                    console.log('cached login')
                    res({id, name})
                }
                else
                {
                    console.log('cached id or name not found')
                    loginPanel.classList.remove('disabled')
                }
            }
            // click
            else
            {
                const input = loginName.value
                if(input.length > 3)
                {
                    localStorage.setItem('name', input)
                    name = input
                    
                    loginPanel.classList.add('disabled')
                    console.log('login new')
                    res({id, name})
                }
                else
                {
                    loginPanel.classList.remove('disabled')
                    loginError.innerText = 'Túl rövid név'
                }   
            }
        }

        loginSubmit.addEventListener('click', login)
        login('init')
    })    
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