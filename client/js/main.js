
//load user data: if response not authorized: logout


const logoutButon = document.querySelector('#logout_button')
const imagePickup = document.querySelector('#image_pickup')
const profilePicture = document.querySelector('#profile_picture')
const spinner = document.querySelector('#spinner_bg')
const ok = document.querySelector('#ok_bg')
const userName= document.querySelector('#user_name')

const token = localStorage.token
loadProfilePicture()
loadUserProfile()
loadSystemInfo()

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))



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
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(resp =>{
            if(resp.status === 401) logout()
            return resp
        }).then(res => res.blob())
          .then(blob => URL.createObjectURL(blob))
          .then(urlObj => profileImage = urlObj)

    } catch (err) {
        console.log('resize fetch error', err.message);
    }

    return profileImage
}

async function loadSystemInfo() {

        fetch('/api/data/getSystemInfo',{
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(resp =>{
            if(resp.status === 401) logout()
            if(resp.status === 404) return
            return resp
        }).then(resp => resp.json())
          .then(res => console.log(res))
          .catch(err => console.log(err))
    
   
}


async function loadUserProfile() {
    fetch('/api/data/getUserProfile',{
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(resp => resp.json())
      .then(jResp => {
        if(jResp.status === 401) logout()
        if(jResp.status === 404) return
        if(jResp.name) userName.textContent = jResp.name
      }).catch(err => console.log(err))

}

async function loadProfilePicture(){

        await fetch('/api/data/getUserProfilePicture', {
           method: 'GET',
           headers: {
               Authorization: `Bearer ${token}`
           }
       }).then(res => {
        if(res.status === 401) {
            logout()
            return res
        }
        if(res.status == 404) return
        else return res

       }).then(resp => resp.blob())
         .then(blob => URL.createObjectURL(blob))
         .then(urlObj => {
            if(urlObj) profilePicture.src = urlObj
         }).catch(err => console.log(err))

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
