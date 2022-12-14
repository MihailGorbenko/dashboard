
//load user data: if response not authorized: logout


// logout: clear local storage, set window.location 

const logoutButon = document.querySelector('#logout_button')
const imagePickup = document.querySelector('#image_pickup')
const spinner = document.querySelector('#spinner_bg')
const ok = document.querySelector('#ok_bg')

setUserProfile()
startDisplaySystemInfo()


imagePickup.addEventListener('change', async e => {
    toggleSpinner()
    const newName = getCookie('userId')
    file = new File([e.target.files[0]], `${newName}`)
    await setProfilePicture(file)
    toggleSpinner()
})


logoutButon.addEventListener('click', e => {
    logout()
})


async function setProfilePicture(picture) {
    const img = await resizeImage(picture, 150, 150)

}

async function resizeImage(image, heigth = 100, width = 100, filter = '') {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('heigth', heigth)
    formData.append('width', width)
    formData.append('filter', filter)
    try {
        const resizedImage = await fetch('/api/data/resizeImage', {
            method: 'POST',
            body: formData
        }).then(res => res)

    } catch (err) {
        console.log('resize fetch error', err.message);
    }


}

async function startDisplaySystemInfo() {

}

async function setUserProfile() {
    toggleSpinner()


    toggleSpinner()
}

async function loadUserProfile() {


}

//logout
function logout() {
    localStorage.setItem('token', '')
    window.location = window.location.origin
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


function getCookie(name) {
    const prefName = name + '='
    const decoded = decodeURIComponent(document.cookie)
    console.log(document.cookie);
    let res = 'nouser'
    decoded.split(';').forEach(el => {
        if (el.startsWith(prefName)) {
            res = el.substring(prefName.length)
        }
    })
    return res
}
