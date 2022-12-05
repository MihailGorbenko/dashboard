
const mainForm = document.querySelector('#main_form')
const signInButton = document.querySelector('#sign_in_button')
const signUpButton = document.querySelector('#sign_up_button')
const spinner = document.querySelector('#spinner_bg')
const signUpTemplate = document.querySelector('#sign_up_form')
const emailFieldInfo = document.querySelector('#email_help')
const emailInput = document.querySelector('#email_input')

mainForm.addEventListener('keypress', (e) => {
   
})


signUpButton.addEventListener('click', async e => {
    e.preventDefault()
    e.stopPropagation()

    email = emailInput.value

    if(!checkEmail(email)){
        emailFieldInfo.classList.add('label-danger')
        emailFieldInfo.textContent = 'Typo in email'
        emailInput.classList.add('is-invalid')
        return;
    } else {
        emailInput.classList.add('is-valid')
        emailFieldInfo.classList.remove('label-danger')
        emailFieldInfo.textContent = ''
    }

    toggleSpinner()
    const exists =  await isUserEmailExists(email)
    toggleSpinner()
    if(exists){
        emailFieldInfo.textContent = 'Account already exists. Try to sign in'
        emailFieldInfo.classList.add('label-danger')
        emailInput.classList.add('is-invalid')
        return
    } else {
        showSighUpForm()
    }
})


function showSighUpForm(){
    mainForm.innerHTML = signUpTemplate.innerHTML
}

async function isUserEmailExists(email)
{
    let user = {
        email : email,
    }

    let result = true;

      await fetch('/api/auth//isUserEmailExists',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }).then(response =>  response.json())
          .then(res => {
            if(res.message === 'not exist') { result = false }
          })

        return result
               
}

function checkEmail(email){
    return String(email)
        .toLocaleLowerCase()
        .match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)
}

function toggleSpinner(){
    spinner.classList.toggle('d-none')
}

