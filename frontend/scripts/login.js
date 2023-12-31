export function Login(id, push)
{
    const loginPanel = document.getElementById('login-panel')
    const loginName = document.getElementById('login-name')
    const loginSubmit = document.getElementById('login-submit')
    const loginError = document.getElementById('login-error')

    const useBrowser = document.getElementById('use-browser')
    const useIos = document.getElementById('use-ios')
    const loginAction = document.getElementById('login-action')

    return new Promise((res, _) => {
        loginPanel.classList.add('disabled')

        const login = (event) =>{

            let name = localStorage.getItem('name')
            // startup
            if(event == 'init')
            {
                if(id && name)
                {
                    console.log('cached login')
                    res(name)
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
                    res(name)
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


        if (navigator.userAgent.match(/FBAN|FBAV/i)) 
        {
            useBrowser.classList.remove('disabled')
            useIos.classList.add('disabled')
            loginAction.classList.add('disabled')
        } 
        else 
        {
            useBrowser.classList.add('disabled')
            useIos.classList.remove('disabled')
            loginAction.classList.remove('disabled')

            let userAgent = navigator.userAgent || navigator.vendor || window.opera
            if( !(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) || ('standalone' in window.navigator) && (window.navigator.standalone))
            {
                useIos.classList.add('disabled')
            }

            loginSubmit.classList.remove('disabled')
        }
    })    
}