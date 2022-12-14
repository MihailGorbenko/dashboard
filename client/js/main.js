
//load user data: if response not authorized: logout


// logout: clear local storage, set window.location 

const logoutButon = document.querySelector('#logout_button')
const imagePickup = document.querySelector('#image_pickup')
const profilePicture = document.querySelector('#profile_picture')
const spinner = document.querySelector('#spinner_bg')
const ok = document.querySelector('#ok_bg')

setUserProfile()
startDisplaySystemInfo()


imagePickup.addEventListener('change', async e => {
    toggleSpinner()
    const newName = getCookie('userId')
    console.log(e.target.files[0]);
    let image = e.target.files[0]
    let sName = image.name.split('.')
    let ext = '.' + sName[sName.length - 1]
    file = new File([image], `${newName}${ext}`)
    await setProfilePicture(file)
    toggleSpinner()
})


logoutButon.addEventListener('click', e => {
    logout()
})


async function setProfilePicture(picture) {
    const img = await resizeImage(picture, 400, 400)
    if(img) profilePicture.src = img

}

async function resizeImage(image, heigth = 100, width = 100) {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('heigth', heigth)
    formData.append('width', width)
    let profileImage = null
    try {
         await fetch('/api/data/setProfilePicture', {
            method: 'POST',
            body: formData
        }).then(res => res.blob())
          .then(blob => URL.createObjectURL(blob))
          .then(urlObj => profileImage = urlObj)

    } catch (err) {
        console.log('resize fetch error', err.message);
    }

    return profileImage
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
