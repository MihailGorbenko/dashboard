
const mainForm = document.querySelector('#main_form')
const signInButton = document.querySelector('#sign_in_button')
const signUpButton = document.querySelector('#sign_up_button')
const spinner = document.querySelector('#spinner_bg')
const ok = document.querySelector('#ok_bg')
const signUpTemplate = document.querySelector('#sign_up_template')
const signInTemplate = document.querySelector('#sign_in_template')
const emailFieldInfo = document.querySelector('#email_help')
let emailInput = document.querySelector('#email_input')

let USER_EMAIL = ''
let SIGN_UP_FORM = false
let mainFormSavedState = null

// preventing enter press actions
mainForm.addEventListener('keypress', (e) => {
    if(e.keyCode == 13) e.preventDefault() 
})

// Sign up button action 
signUpButton.addEventListener('click', async e => {
    SIGN_UP_FORM = true
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
        runSighUpForm()
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
        runSighInForm()
    }
    
})

// Setting input state "valid"
function inputStateValid(infoLabel,inputEl, infoText){
    inputEl.classList.add('is-valid')
    inputEl.classList.remove('is-invalid')
    infoLabel.classList.remove('label-danger')
    infoLabel.textContent = infoText
}


// Setting input state "invalid"
function inputStateInvalid(infoLabel, inputEl, infoText){
    infoLabel.classList.add('label-danger')
    infoLabel.textContent = infoText
    inputEl.classList.add('is-invalid')
    inputEl.classList.remove('is-valid')
}


//  Sign up form
function runSighUpForm(){
    console.log('Show sign up form')
    mainForm.innerHTML = signUpTemplate.innerHTML
    const setNameInput = document.querySelector('#sign_up_name_input')
    const setPasswordInput = document.querySelector('#sign_up_password_input')
    const setPasswordConfirm = document.querySelector('#sign_up_password_input_confirm')
    const signUpAction = document.querySelector('#sign_up_action')
    const setPasswordInfo = document.querySelector('#sign_up_password_help')
    const setNameInfo = document.querySelector('#sign_up_name_help')
    const setPasswordConfirmLabel = document.querySelector('#sign_up_password_confirm_help')

    setNameInput.addEventListener('blur',e => {
        text = e.target.value

        if(text.length < 1){
            inputStateInvalid(setNameInfo,setNameInput,'Name is required')
        }
        else if(!text.match(/^[A-Za-z]+$/)){
            inputStateInvalid(setNameInfo,setNameInput,'Use alphabetic symbols only')
        }
        else if(text.length < 2 ){
            inputStateInvalid(setNameInfo,setNameInput,'Minimal length 2 symbols')
        }
        else  inputStateValid(setNameInfo,setNameInput,'')
    })

    setPasswordInput.addEventListener('input',e => {
        if(!checkPassword(e.target.value)){
            inputStateInvalid(setPasswordInfo,setPasswordInput,'Must contain as least one A-Z chars,at least one digit, and min 8 symbols length')
        }

        else inputStateValid(setPasswordInfo,setPasswordInput,'Strong password')

    })

    setPasswordConfirm.addEventListener('input',e => {
        inputStateInvalid(setPasswordConfirmLabel,setPasswordConfirm,'Confirm password')

        if(e.target.value.localeCompare(setPasswordInput.value) === 0){
            inputStateValid(setPasswordConfirmLabel,setPasswordConfirm,'Confirm password')
        }
    })

    signUpAction.addEventListener('click',async e => {
        let userName = setNameInput.value
        let password = setPasswordInput.value
        console.log(userName,password);

        try{
            toggleSpinner()
            let resp = await tryRegister(USER_EMAIL,userName,password)
            toggleSpinner()

            if(resp.message === 'created'){
                await showOkBlocking()
               
            }

            else if(resp.message === 'error'){
                console.log('REGISTER_ERROR');
            }

        } catch(err) {
            console.log('Register error',err.message);
            return
        }
    })

}



// Sign in form
function runSighInForm(){
    console.log('Show sign in form')
    console.log(signInTemplate);
    mainForm.innerHTML = signInTemplate.innerHTML
    const passwordRestore = document.querySelector('#password_restore')
    const passwordInfo = document.querySelector('#password_help')
    const signInAction = document.querySelector('#sign_in_action')
    const passwordInput = document.querySelector('#sign_in_password_input')

    signInAction.addEventListener('click',async e => {
        
        try {
            toggleSpinner()
            let resp = await tryLogin(USER_EMAIL,passwordInput.value)
            toggleSpinner()

            console.log(resp);
            if(resp.message === 'password invalid'){
                console.log('Password invalid. setting state');
                inputStateInvalid(passwordInfo,passwordInput,'Password is invalid!')
                return
            }
            inputStateValid(passwordInfo,passwordInput,'')
            // get token and run main page
            runMainPage()  
        
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


// api call /api/auth/register
async function tryRegister(email,name,password){
    let user = {
        email : email,
        password: password,
        name: name
    }

    let resp = await fetch('/api/auth/register',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(response => response.json())


return resp 

}

// api call /api/auth/login
async function tryLogin(email,password){
    let user = {
        email : email,
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


function runMainPage(){
    window.location = window.location + 'main'
}


// checking user email for valid and exists
async function checkUserEmailExists(email){
    toggleSpinner()
    const exists =  await isUserEmailExists(email)
    toggleSpinner()
    console.log('checkUserEmailExist: exists',exists);
    return exists
}


// email input validation
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
   return  password.match(/(?=.{8,})(?=.*[0-9])(?=.*[A-Z])/)
    
}

function toggleSpinner(){
    spinner.classList.toggle('d-none')
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showOkBlocking(){
    ok.classList.toggle('d-none')
    await sleep(1000)
    ok.classList.toggle('d-none')
}

