
const mainForm = document.querySelector('#main_form')
const signInButton = document.querySelector('#sign_in_button')
const signUpButton = document.querySelector('#sign_up_button')
const spinner = document.querySelector('#spinner_bg')
const signUpTemplate = document.querySelector('#sign_up_template')
const signInTemplate = document.querySelector('#sign_in_template')
const emailFieldInfo = document.querySelector('#email_help')
const emailInput = document.querySelector('#email_input')

let USER_EMAIL = ''



mainForm.addEventListener('keypress', (e) => {
    if(e.keyCode == 13) e.preventDefault() 
})

// Sign up button action 
signUpButton.addEventListener('click', async e => {
    e.preventDefault()
    e.stopPropagation()
    USER_EMAIL = emailInput.value

    if (!validateEmailInput()) {
        console.log('Sign up validate: invalid');
        return
    }
   
    const exists = await checkUserEmailExists(USER_EMAIL)
    if(exists){
        console.log('Sign in: user exists! setting state');
        inputStateInvalid(emailFieldInfo,emailInput,'Account already exists. Try to sign in')
        return
    } else {
        console.log('Sign up: user not exists! setting state');
        inputStateValid(emailFieldInfo,emailInput,'')
        console.log('Sign up: call show form')
        showSighUpForm()
    }
})


//  Sign in button action

signInButton.addEventListener('click', async e => {
    console.log('Sign in click');
    e.preventDefault()
    e.stopPropagation()

    USER_EMAIL = emailInput.value

    if(!validateEmailInput()){
        console.log('Sign in validate: invalid');
        return
    } 
    
    const exists = await checkUserEmailExists(USER_EMAIL)

    if(!exists){
        console.log('Sign in: user not exists! setting state');
        inputStateInvalid(emailFieldInfo,emailInput,'Account not exists exists. Please sign up first')
        return
    } else {
        console.log('Sign in: user  exists! setting state');
        inputStateValid(emailFieldInfo,emailInput,'')
        console.log('Sign in: call show form')
        showSighInForm()
    }
    
})


function inputStateValid(infoLabel,inputEl, infoText){
    inputEl.classList.add('is-valid')
    inputEl.classList.remove('is-invalid')
    infoLabel.classList.remove('label-danger')
    infoLabel.textContent = infoText
}

function inputStateInvalid(infoLabel, inputEl, infoText){
    infoLabel.classList.add('label-danger')
    infoLabel.textContent = infoText
    inputEl.classList.add('is-invalid')
    inputEl.classList.remove('is-valid')
}

function showSighUpForm(){
    
    console.log('Show sign up form')
    mainForm.innerHTML = signUpTemplate.innerHTML
}

function showSighInForm(){
    console.log('Show sign in form')
    mainForm.innerHTML = signInTemplate.innerHTML
    const passwordRestore = document.querySelector('#password_restore')
    const passwordInfo = document.querySelector('#password_help')
    const signInAction = document.querySelector('#sign_in_action')
    const passwordInput = document.querySelector('#sign_in_password_input')

    signInAction.addEventListener('click',async e => {
        
        try {
            toggleSpinner()
            let resp = await tryLogin(passwordInput.value)
            toggleSpinner()

            console.log(resp);
            if(resp.message === 'password invalid'){
                console.log('Password invalid. setting state');
                inputStateInvalid(passwordInfo,passwordInput,'Password is invalid!')
                return
            }
            inputStateValid(passwordInfo,passwordInput,'')
            // get token and show main page
            try{
                toggleSpinner()
                let html = await loadMainPage()
                toggleSpinner()
                runMainPage(html)

                } catch(err) {
                    console.log('Error loading main page: ',err.message)
                    toggleSpinner()
                    return
                    }
        
            } catch(err) {
                console.log('Error in login: ',err.message) 
                toggleSpinner()
                return
        }
        
        


          
    })

    passwordRestore.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        console.log('forgot click');
        passwordInfo.textContent = 'Remember next time!'

    })
}

async function tryLogin(password){
    let user = {
        email : USER_EMAIL,
        password: password
    }
    
   
    let resp = await fetch('/api/auth/login',{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(user)
                        }).then(response => response.json())
                

       return resp 
}


function runMainPage(html){
    document.querySelector('body').innerHTML = html
     // inflate page, add listeners
}

async function loadMainPage(){
    
    return  await fetch('/main',{
        method:'GET'
    }).then(resp => resp.text())

}

async function checkUserEmailExists(email){
    toggleSpinner()
    const exists =  await isUserEmailExists(email)
    toggleSpinner()
    console.log('checkUserEmailExist: exists',exists);
    return exists
}
 function validateEmailInput(){
    
    let correct = checkEmail(USER_EMAIL)

    console.log('Email correct:',correct);
    if(correct){
        console.log('Email corect, setting state valid');
        inputStateValid(emailFieldInfo,emailInput,'')
        return true
        

    } else {
        console.log('Email incorect, setting state invalid');
        inputStateInvalid(emailFieldInfo,emailInput,'Typo in email')
        return false  
    }
}

// Check user email exist api /api/authisUserEmailExists
async function isUserEmailExists(email)
{
    let user = {
        email : email,
    }

    let result = true;

      await fetch('/api/auth/isUserEmailExists',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }).then(response =>  response.json())
          .then(res => {
            if(res.message === 'not exist') {
                 console.log('Api request: not exist');
                 result = false 
                }
          })

        return result
               
}


function checkEmail(email){
    let res =  String(email)
        .toLocaleLowerCase()
        .match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)
        if(res === null) {
            console.log('checkEmail: invalid');
            return false
        }else {
            console.log('checkEmail: valid');
            return true
        }
}

function checkPassword(password){
    
}

function toggleSpinner(){
    spinner.classList.toggle('d-none')
}

