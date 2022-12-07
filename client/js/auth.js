
const mainForm = document.querySelector('#main_form')
const signInButton = document.querySelector('#sign_in_button')
const signUpButton = document.querySelector('#sign_up_button')
const spinner = document.querySelector('#spinner_bg')
const signUpTemplate = document.querySelector('#sign_up_form')
const emailFieldInfo = document.querySelector('#email_help')
const emailInput = document.querySelector('#email_input')
const signInTemplate = document.querySelector('#sign_in_form')

mainForm.addEventListener('keypress', (e) => {
    if(e.keyCode == 13) e.preventDefault() 
})

// Sign up button action 
signUpButton.addEventListener('click', async e => {
    e.preventDefault()
    e.stopPropagation()
    if (!validateEmailInput()) {
        console.log('Sign up validate: invalid');
        return
    }
   
    const exists = await checkUserEmailExists()
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
    if(!validateEmailInput()){
        console.log('Sign in validate: invalid');
        return
    } 
    
    const exists = await checkUserEmailExists()

    if(!exists){
        console.log('Sign in: user not exists! setting state');
        inputStateInvalid(emailFieldInfo,emailInput,'Account not exists exists. Please sign up first')
        return
    } else {
        console.log('Sign in: user not exists! setting state');
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
    passwordRestore.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        passwordInfo.textContent = 'Remember next time!'

    })
}

function loadMain(){

}

async function checkUserEmailExists(){
    toggleSpinner()
    const exists =  await isUserEmailExists(email)
    toggleSpinner()
    console.log('checkUserEmailExist: exists',exists);
    return exists
}
 function validateEmailInput(){
    email = emailInput.value
    let correct = checkEmail(email)
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

