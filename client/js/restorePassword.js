import { NetworkLoger } from "./logger.js"
const loger = new NetworkLoger('main')

const setPasswordInput = document.querySelector('#restore_password_input')
const setPasswordConfirm = document.querySelector('#restore_password_input_confirm')
const restoreAction = document.querySelector('#restore_action')
const setPasswordInfo = document.querySelector('#restore_password_help')
const setPasswordConfirmLabel = document.querySelector('#restore_password_confirm_help')
const spinner = document.querySelector('#spinner_bg')
const ok = document.querySelector('#ok_bg')
const bad = document.querySelector('#bad_bg')
const mainForm = document.querySelector('#main_form')

initPasswordIcons()


setPasswordInput.addEventListener('input', e => {
    if (!checkPassword(e.target.value)) {
        inputStateInvalid(setPasswordInfo, setPasswordInput, 'Must contain as least one A-Z chars,at least one digit, and min 8 symbols length')
    }

    else inputStateValid(setPasswordInfo, setPasswordInput, 'Strong password')

})

setPasswordConfirm.addEventListener('input', e => {
    inputStateInvalid(setPasswordConfirmLabel, setPasswordConfirm, 'Confirm password')

    if (e.target.value.localeCompare(setPasswordInput.value) === 0) {
        inputStateValid(setPasswordConfirmLabel, setPasswordConfirm, 'Confirm password')
    }
})


restoreAction.addEventListener('click', async e => {
    const log = loger.clone('Restore action')
    await log.info('running')

    let password = setPasswordInput.value
    let passwordConfirm = setPasswordConfirm.value
    let alert = document.createElement('div')

    if (password.length < 1) {
        inputStateInvalid(setPasswordInfo, setPasswordInput, 'Password is required')
        return
    }
    if (passwordConfirm !== password) {
        inputStateInvalid(setPasswordConfirmLabel, setPasswordConfirm, 'Confirm password')
        return
    }

    let pswd = {
        password:password
    }
    toggleSpinner()
    await fetch('/api/auth/passwordResetFromForm',{
        method: 'POST',
        credentials: 'include',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pswd)

    }).then(resp => resp.json())
      .then(async resp => {
        toggleSpinner()
        if (resp.message === 'reset') {
            await showOkBlocking()
            alert.innerHTML = '<div class="alert alert-success mt-3 mb-0" style="padding: 0.5em; text-align:center;"role="alert">Password reset successfully!</div>'
            mainForm.firstElementChild.appendChild(alert)
            await sleep(1000)
            mainForm.firstElementChild.removeChild(alert)
        }
        else{
            alert.innerHTML = '<div class="alert alert-danger mt-3 mb-0" style="padding: 0.5em; text-align:center;"role="alert">Something went wrong!</div>'
            mainForm.firstElementChild.appendChild(alert)
            await sleep(1000)
            mainForm.firstElementChild.removeChild(alert)
            
        
        }
      }).catch(async err => {
        await log.error(err)
        hideSpinner()
        await showBadBlocking()
      })

      window.location = window.location.origin
  
})


// Setting input state "valid"
function inputStateValid(infoLabel, inputEl, infoText) {
    inputEl.classList.add('is-valid')
    inputEl.classList.remove('is-invalid')
    infoLabel.classList.remove('label-danger')
    infoLabel.textContent = infoText
}


// Setting input state "invalid"
function inputStateInvalid(infoLabel, inputEl, infoText) {
    infoLabel.classList.add('label-danger')
    infoLabel.textContent = infoText
    inputEl.classList.add('is-invalid')
    inputEl.classList.remove('is-valid')
}



function initPasswordIcons() {
    const passwordIcons = document.querySelectorAll('.password-icon')
    //setting show password
    passwordIcons.forEach(passwordIcon =>
        passwordIcon.addEventListener('click', e => {
            let passwordInput = e.target.parentNode.firstElementChild
            let shownIcon = e.target.lastElementChild
            let hideIcon = e.target.firstElementChild
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            shownIcon.classList.toggle('hide')
            hideIcon.classList.toggle('hide')
        })
    )
}


function toggleSpinner() {
    spinner.classList.toggle('d-none')
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showOkBlocking() {
    ok.classList.toggle('d-none')
    await sleep(1000)
    ok.classList.toggle('d-none')
}

function hideSpinner() {
    spinner.classList.add('d-none')
}

async function showBadBlocking() {
    bad.classList.toggle('d-none')
    await sleep(1000)
    bad.classList.toggle('d-none')
}

function checkPassword(password) {
    return password.match(/(?=.{8,})(?=.*[0-9])(?=.*[A-Z])/)

}