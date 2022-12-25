
import { NetworkLoger } from "./logger.js"

const loger = new NetworkLoger('main')
const mainForm = document.querySelector('#main_form')
const signInButton = document.querySelector('#sign_in_button')
const signUpButton = document.querySelector('#sign_up_button')
const spinner = document.querySelector('#spinner_bg')
const ok = document.querySelector('#ok_bg')
const bad = document.querySelector('#bad_bg')
const signUpTemplate = document.querySelector('#sign_up_template')
const signInTemplate = document.querySelector('#sign_in_template')
const emailFieldInfo = document.querySelector('#email_help')
let emailInput = document.querySelector('#email_input')

let USER_EMAIL = ''
let SIGN_UP_FORM = false
let mainFormSavedState = null
let signUpForm = document.createElement('div')
signUpForm.innerHTML = signUpTemplate.innerHTML
let signInForm = document.createElement('div')
signInForm.innerHTML = signInTemplate.innerHTML

document.enterListener = signInButton


// preventing enter press actions
mainForm.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
        e.preventDefault()
        document.enterListener.dispatchEvent(new Event('click'))

    }
})

 await tryRestoreSession()

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

// Sign up button action 
signUpButton.addEventListener('click', async e => {

    const log = loger.clone('Sign up action')
    await log.info('running')

    SIGN_UP_FORM = true
    e.preventDefault()
    e.stopPropagation()
    USER_EMAIL = emailInput.value


    if (!validateEmailInput()) {
        await log.info('email input incorect');
        return
    }

    try {
        const exists = await checkUserEmailExists(USER_EMAIL)
        if (exists) {
            await log.info('user exists');
            inputStateInvalid(emailFieldInfo, emailInput, 'Account already exists. Try to sign in')
            return
        } else {
            await log.info('user not exist');
            inputStateValid(emailFieldInfo, emailInput, '')
            await log.info('calling sign up form')
            runSighUpForm()
        }
    } catch (err) {
        await log.error(err)
    }

})


//  Sign in button action

signInButton.addEventListener('click', async e => {
    const log = loger.clone('Sign in action')
    await log.info('running')

    e.preventDefault()
    e.stopPropagation()

    USER_EMAIL = emailInput.value

    if (!validateEmailInput()) {
        await log.info('email input incorect');
        return
    }

    try {
        const exists = await checkUserEmailExists(USER_EMAIL)

        if (!exists) {
            await log.info('user not exist');
            inputStateInvalid(emailFieldInfo, emailInput, 'Account not exists. Please sign up first')
            return
        } else {
            await log.info('user  exists');
            inputStateValid(emailFieldInfo, emailInput, '')
            await log.info('calling sign in form')
            runSighInForm()
        }

    } catch (err) {
        await log.error(err)
        await showBadBlocking()
    }

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

//try restore login session
async function tryRestoreSession() {

    const log = loger.clone('Try restore session')
    await log.info('trying restore session')

    try {
        let token = localStorage.getItem('token')
        await log.info(`got token from localStorage  ${token}`);
        if (token) {
            await log.info('verifying token...');
            toggleSpinner()
            let tokenValid = await validateToken(token)

            if (tokenValid) {
                await  log.info('token valid');
                await log.info('calling main page');
                runMainPage()
                return
            }

            await log.info('token invalid or expired');
            toggleSpinner()
            return

        }

    } catch (err) {
        await log.error(err)
        hideSpinner()
    }

}


// api call  /api/auth/validateToken
async function validateToken(token) {
    const log = loger.clone('Api call  /api/auth/validateToken')
    await log.info('running')

    await log.info(`Sending token ${token}`);

    let valid

    await fetch('/api/auth/validateToken', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(async resp => {
        if (resp.ok) {
            await log.info('token valid');
            valid = true
        }
        else valid = false
    }).catch(async err => {
        await log.error(err)
        throw err
    })

    return valid
}


//  Sign up form
async function runSighUpForm() {
    const log = loger.clone('Sign up form')
    await log.info('running')

    mainFormSavedState = mainForm.removeChild(mainForm.firstElementChild)
    mainForm.appendChild(signUpForm)
    const setNameInput = document.querySelector('#sign_up_name_input')
    const setPasswordInput = document.querySelector('#sign_up_password_input')
    const setPasswordConfirm = document.querySelector('#sign_up_password_input_confirm')
    const signUpAction = document.querySelector('#sign_up_action')
    const setPasswordInfo = document.querySelector('#sign_up_password_help')
    const setNameInfo = document.querySelector('#sign_up_name_help')
    const setPasswordConfirmLabel = document.querySelector('#sign_up_password_confirm_help')
    document.enterListener = signUpAction
    initPasswordIcons()

    setNameInput.addEventListener('blur', e => {
        let text = e.target.value

        if (text.length < 1) {
            inputStateInvalid(setNameInfo, setNameInput, 'Name is required')
        }
        else if (!text.match(/^[A-Za-z]+$/)) {
            inputStateInvalid(setNameInfo, setNameInput, 'Use alphabetic symbols only')
        }
        else if (text.length < 2) {
            inputStateInvalid(setNameInfo, setNameInput, 'Minimal length 2 symbols')
        }
        else inputStateValid(setNameInfo, setNameInput, '')
    })

    setPasswordInput.addEventListener('input', e => {
        if (!checkPassword(e.target.value)) {
            inputStateInvalid(setPasswordInfo, setPasswordInput, 'Must contain as least one A-Z chars,at least one digit, and min 8 symbols length')
        }

        else inputStateValid(setPasswordInfo, setPasswordInput, 'Strong password')

    })

    setPasswordConfirm.addEventListener('input', e => {
        inputStateInvalid(setPasswordConfirmLabel, setPasswordConfirm, 'Confirm password')

        if (e.target.value.localeCompare(setPasswordInput.value) === 0) {
            inputStateValid(setPasswordConfirmLabel, setPasswordConfirm, 'Password match')
        }
    })

    signUpAction.addEventListener('click', async e => {
        const log = loger.clone('Sign up action')
        await log.info('running')

        let userName = setNameInput.value
        let password = setPasswordInput.value
        let passwordConfirm = setPasswordConfirm.value

        if (userName.length < 1) {
            inputStateInvalid(setNameInfo, setNameInput, 'Name is required')
            return
        }
        if (password.length < 1) {
            inputStateInvalid(setPasswordInfo, setPasswordInput, 'Password is required')
            return
        }
        if (passwordConfirm !== password) {
            inputStateInvalid(setPasswordConfirmLabel, setPasswordConfirm, 'Confirm password')
            return
        }

        try {
            await log.info(`registring ${userName}`)

            toggleSpinner()
            let resp = await tryRegister(USER_EMAIL, userName, password)
            toggleSpinner()

            if (resp.message === 'created') {
                await showOkBlocking()
                mainForm.removeChild(mainForm.firstElementChild)
                mainForm.appendChild(mainFormSavedState)
                document.enterListener = signInButton
                let alert = document.createElement('div')
                alert.innerHTML = '<div class="alert alert-success mt-3 mb-0" style="padding: 0.5em; text-align:center;"role="alert">Now you can sign in!</div>'
                mainForm.firstElementChild.appendChild(alert)
                await sleep(5000)
                mainForm.firstElementChild.removeChild(alert)
            }

            else if (resp.message === 'error') {
                await log.info('registering error');
            }

        } catch (err) {
            await log.error(err);
            hideSpinner()
            await showBadBlocking()
            return
        }
    })

}



// Sign in form
async function runSighInForm() {
    const log = loger.clone('Sign in form')
    await log.info('running')

    mainFormSavedState = mainForm.removeChild(mainForm.firstElementChild)
    mainForm.appendChild(signInForm)
    const passwordRestore = document.querySelector('#password_restore')
    const passwordInfo = document.querySelector('#password_help')
    const signInAction = document.querySelector('#sign_in_action')
    const passwordInput = document.querySelector('#sign_in_password_input')
    document.enterListener = signInAction
    initPasswordIcons()

    signInAction.addEventListener('click', async e => {

        try {
            toggleSpinner()
            let resp = await tryLogin(USER_EMAIL, passwordInput.value)
            toggleSpinner()

            if (resp.message === 'password invalid') {
                await log.info('password invalid');
                inputStateInvalid(passwordInfo, passwordInput, 'Password is invalid!')
                return
            }
            await log.info('Authorized');
            await log.info(`got cookie ${document.cookie}`)
            await log.info(`got token ${resp.token}`)
            inputStateValid(passwordInfo, passwordInput, '')
            localStorage.setItem('token', resp.token)
            await log.info('saved token to localStorage');
            await log.info('calling main page');
            runMainPage()

        } catch (err) {
            await log.error(err)
            hideSpinner()
            await showBadBlocking()
            return
        }

    })

    passwordRestore.addEventListener('click', async e => {
        const log = loger.clone('Password restore action')
        await log.info('running')

        e.preventDefault()
        e.stopPropagation()
        const email = {
            email: USER_EMAIL
        }

        toggleSpinner()
        let res = await fetch('/api/auth/passwordReset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(email)
        }).then(res => res.json())
            .then(async res => {
                await log.info(res.message)
                toggleSpinner()
                let alert = document.createElement('div')
                alert.innerHTML = `<div class="alert alert-success mt-3 mb-0" style="padding: 0.5em; text-align:center;"role="alert">Reset message sent on your email: ${USER_EMAIL}</div>`
                mainForm.firstElementChild.appendChild(alert)
                await sleep(5000)
                mainForm.firstElementChild.removeChild(alert)
            })
            .catch(async err => {
                await log.error(err)
                hideSpinner()
                await showBadBlocking()
                return

            })

    })
}


// api call /api/auth/register
async function tryRegister(email, name, password) {

    const log = loger.clone('Api call /api/auth/register')
    await log.info('running')

    let user = {
        email: email,
        password: password,
        name: name
    }

    let resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(res => res.json())
        .catch(async err => {
            await log.error(err)
            throw err
        })

    return resp

}

// api call /api/auth/login
async function tryLogin(email, password) {
    const log = loger.clone('Api call /api/auth/login')
    await log.info('running')

    let user = {
        email: email,
        password: password
    }

    let resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(res => res.json())
        .catch(async err => {
            await log.error(err)
            throw err
        })

    return resp
}


function runMainPage() {
    window.location.assign(window.location.toString() + 'main')
}




// checking user email for valid and exists
async function checkUserEmailExists(email) {
    const log = loger.clone('Api call /api/auth/isUserEmailExists')
    await log.info('running')
    let user = {
        email: email,
    }

    toggleSpinner()
    let exists

    await fetch('/api/auth/isUserEmailExists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(response => response.json())
        .then(async res => {
            if (res.message === 'not exist') {
                await  log.info('email not exist');
                exists = false
                return
            }
            exists = true
        })
        .catch(async err => {
            await log.error(err)
            hideSpinner()
            throw err
        })

    toggleSpinner()
    return exists

}


// email input validation
function validateEmailInput() {

    let correct = checkEmail(USER_EMAIL)
    if (correct) {
        inputStateValid(emailFieldInfo, emailInput, '')
        return true

    } else {
        inputStateInvalid(emailFieldInfo, emailInput, 'Typo in email')
        return false
    }
}




function checkEmail(email) {
    let res = String(email)
        .toLocaleLowerCase()
        .match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)
    if (!res) {
        return false
    } else {
        return true
    }
}

function checkPassword(password) {
    return password.match(/(?=.{8,})(?=.*[0-9])(?=.*[A-Z])/)

}

function toggleSpinner() {
    spinner.classList.toggle('d-none')
}

function hideSpinner() {
    spinner.classList.add('d-none')
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showOkBlocking() {
    ok.classList.toggle('d-none')
    await sleep(1000)
    ok.classList.toggle('d-none')
}

async function showBadBlocking() {
    bad.classList.toggle('d-none')
    await sleep(1000)
    bad.classList.toggle('d-none')
}



