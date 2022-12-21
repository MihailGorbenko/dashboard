//--------------Shared-------------------
const spinner = document.querySelector('#spinner_bg')
const ok = document.querySelector('#ok_bg')
const main = document.querySelector('#main')
const token = localStorage.token

const homeContent = document.createElement('div')
homeContent.innerHTML = document.querySelector('#home').innerHTML
const imageResizeContent = document.createElement('div')
imageResizeContent.innerHTML = document.querySelector('#image_resize').innerHTML
main.appendChild(homeContent)

//-------------- Sidebar---------------
const logoutButon = document.querySelector('#logout_button')
const imagePickup = document.querySelector('#image_pickup')
const profilePicture = document.querySelector('#profile_picture')
const userName= document.querySelector('#user_name')
const sidebarToogler = document.querySelector('#sidebar_toggler')
const staticPoper = document.querySelector('.static-poper')
const resizeLink = document.querySelector('#resize_link')
const homeLink = document.querySelector('#home_link')

loadProfilePicture()
loadUserProfile()

homeLink.addEventListener('click', e => {
    e.preventDefault()
    main.removeChild(imageResizeContent)
    main.appendChild(homeContent)

})


resizeLink.addEventListener('click', e => {
    e.preventDefault()
    main.removeChild(homeContent)
    main.appendChild(imageResizeContent)
    initResizePage()

})

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
    staticPoper.classList.add('d-none')

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


async function loadUserProfile() {
    fetch('/api/data/getUserProfile',{
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => {
        if(res.status === 401) {
            logout()
            return null
        }
        if(res.status === 404) return null
        return res
      }).then(res => res ? res.json() : null)
        .then(res => res ? userName.textContent = res.name : null )
        .catch(err =>  console.log(err))

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
        return null
    }
    if(res.status == 404){
        staticPoper.classList.remove('d-none')
        return null
    } 
    return res
   }).then(res => res ? res.blob() : null)
     .then(blob => blob ? URL.createObjectURL(blob) : null)
     .then(urlObj => {
        if(urlObj) {
            profilePicture.src = urlObj
            staticPoper.classList.add('d-none')
        }
     }).catch(err => console.log(err))

}

function logout() {
localStorage.setItem('token', '')
window.location = window.location.origin
}



//--------Home-----------------
loadSystemInfo()

try{
    window.memoryChart = new EasyPieChart(document.querySelector('.chart'), {
        easing: 'easeOutElastic',
        delay: 3000,
        size: 250,
        barColor: '#198754',
        trackColor: '#5fe6bedb',
        scaleColor: false,
        lineWidth: 22,
        trackWidth: 16,
        lineCap: 'butt',
        onStep: function(from, to, percent) {
            this.el.children[0].innerHTML = Math.round(percent);
        }
    })
} catch(err){console.log(err);}


async function loadSystemInfo() {

        fetch('/api/data/getSystemInfo',{
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res =>{
            if(res.status === 401){
                logout()
                return null
            } 
            if(res.status === 404) return null
            return res
        }).then(res => res ? res.json() : null)
          .then(res => res ? bindSystemDataFields(res) : null)
          .catch(err => console.log(err))
    
   
}

function bindSystemDataFields(data){
    const infoPlatform = document.querySelector('#info_platform')
    const infoHostname = document.querySelector('#info_hostname')
    const infoRelease = document.querySelector('#info_release')
    const infoArch = document.querySelector('#info_arch')
    const infoUptime = document.querySelector('#info_uptime')
    const infoTotalmem = document.querySelector('#info_totalmem')
    const infoFreemem = document.querySelector('#info_freemem')
    infoPlatform.textContent =  data.platform
    infoHostname.textContent = data.hostname
    infoRelease.textContent = data.release
    infoArch.textContent = data.pArch
    infoUptime.textContent = convertToTimeString(data.uptime)
    infoFreemem.textContent = formatBytes(parseFloat(data.freemem))
    infoTotalmem.textContent =   formatBytes(parseFloat(data.totalmem))
    window.memoryChart.update((parseFloat(data.freemem) / (parseFloat(data.totalmem) / 100) ))

}


//----------------Image resize---------
function initResizePage(){
    const widthField = document.querySelector('#width')
const heightField = document.querySelector('#height')
const heightRange = document.querySelector('#height_range')
const widthRange = document.querySelector('#width_range')
const selectFile = document.querySelector('#select_file')
const selectedImage = document.querySelector('#selected_image')
const resizeButton = document.querySelector('#resize_button')
const reader = new FileReader()

heightRange.addEventListener('input', e => {
    heightField.value = e.target.value
})

widthRange.addEventListener('input', e => {
    widthField.value = e.target.value
})

selectFile.addEventListener('change', e => {
    imageFile = e.target.files[0]
    reader.readAsDataURL(imageFile)
    resizeButton.disabled = false

})

reader.addEventListener('load', () => {
    selectedImage.src = reader.result
},false)


resizeButton.addEventListener('click', e => {
 const resultListContainer = document.querySelector('#result_list_container')
 const resultList = document.createElement('ul')
 resultList.classList.add('list-group', 'navbar-dark', 'list-unstyled')

///create form data ,send on server, get array of paths, for each create li element,set src for  download
 resultListContainer.innerHTML = resultList.outerHTML
})

}







//----------- Helpers ------------------

function convertToTimeString(secs){
    let hours = secs / 3600
    let minutes = (hours % 1) * 60
    let seconds = (minutes % 1) * 60
    hours = Math.floor(hours)
    minutes = Math.floor(minutes)
    seconds = Math.floor(seconds)

    return  `${(hours > 0) ? `${hours}h` : ''} ` +
            `${(minutes > 0) ? `${minutes}m` : ''} `+
            `${seconds}s`
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


function formatBytes(bytes, decimals = 1) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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
