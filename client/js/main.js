import { NetworkLoger } from './logger.js'
const logger = new NetworkLoger('main')
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
const userName = document.querySelector('#user_name')
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
    const log =  logger.clone('Profile image pickup')
    await log.info('running')
   
    const newName = getCookie('userId')
    if(e.target.files.length > 0){
        try{
           
            let image = e.target.files[0]
            let sName = image.name.split('.')
            let ext = '.' + sName[sName.length - 1]
            const file = new File([image], `${newName}${ext}`)
            toggleSpinner()
            await setProfilePicture(file)
            toggleSpinner()
        }catch(err){
            await log.error(err)
            hideSpinner()
            return
            
        }

    }

})

logoutButon.addEventListener('click', e => {
    logout()
})

async function setProfilePicture(picture) {
    let log = logger.clone('Set profile image')
    await log.info('running')

    try {
        const img = await resizeProfileImage(picture, 400, 400)
        if (img) profilePicture.src = img
        staticPoper.classList.add('d-none')
    } catch (err) {
        log.error(err)
    }


}

async function resizeProfileImage(image, heigth = 100, width = 100) {
    let log = logger.clone('Resize profile image')
    await log.info('running')
    const formData = new FormData()
    formData.append('image', image)
    formData.append('heigth', heigth)
    formData.append('width', width)
    let profileImage = null

    await fetch('/api/data/setProfilePicture', {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(resp => {
        if (resp.status === 401) logout()
        return resp
    }).then(res => res.blob())
        .then(blob => URL.createObjectURL(blob))
        .then(urlObj => profileImage = urlObj)
        .catch(async err => {
            await log.error(err)
            throw err
        })

    return profileImage
}


async function loadUserProfile() {
    let log = logger.clone('Load profile ')
    await log.info('running')

    await fetch('/api/data/getUserProfile', {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => {
        if (res.status === 401) {
            logout()
            return null
        }
        if (res.status === 404) return null
        return res
    }).then(res => res ? res.json() : null)
        .then(res => res ? userName.textContent = res.name : null)
        .catch(async err => await log.error(err))

}


async function loadProfilePicture() {
    let log = logger.clone('Load profile picture ')
    await log.info('running')

    await fetch('/api/data/getUserProfilePicture', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => {
        if (res.status === 401) {
            logout()
            return null
        }
        if (res.status == 404) {
            staticPoper.classList.remove('d-none')
            return null
        }
        return res
    }).then(res => res ? res.blob() : null)
        .then(blob => blob ? URL.createObjectURL(blob) : null)
        .then(urlObj => {
            if (urlObj) {
                profilePicture.src = urlObj
                staticPoper.classList.add('d-none')
            }
        }).catch(async err => await log.error(err))

}

function logout() {
    localStorage.removeItem('token')
    window.location.replace(window.location.origin.toString()) 
}



//--------Home-----------------
loadSystemInfo()

try {
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
        onStep: function (from, to, percent) {
            this.el.children[0].innerHTML = Math.round(percent);
        }
    })
} catch (err) { await logger.error(err) }


async function loadSystemInfo() {

    let log = logger.clone('Load system info')
    await log.info('running')

    await fetch('/api/data/getSystemInfo', {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => {
        if (res.status === 401) {
            logout()
            return null
        }
        if (res.status === 404) return null
        return res
    }).then(res => res ? res.json() : null)
        .then(res => res ? bindSystemDataFields(res) : null)
        .catch(async err => await log.error(err))


}

function bindSystemDataFields(data) {
    const infoPlatform = document.querySelector('#info_platform')
    const infoHostname = document.querySelector('#info_hostname')
    const infoRelease = document.querySelector('#info_release')
    const infoArch = document.querySelector('#info_arch')
    const infoUptime = document.querySelector('#info_uptime')
    const infoTotalmem = document.querySelector('#info_totalmem')
    const infoFreemem = document.querySelector('#info_freemem')
    infoPlatform.textContent = data.platform
    infoHostname.textContent = data.hostname
    infoRelease.textContent = data.release
    infoArch.textContent = data.pArch
    infoUptime.textContent = convertToTimeString(data.uptime)
    infoFreemem.textContent = formatBytes(parseFloat(data.freemem))
    infoTotalmem.textContent = formatBytes(parseFloat(data.totalmem))
    window.memoryChart.update((parseFloat(data.freemem) / (parseFloat(data.totalmem) / 100)))

}


//----------------Image resize---------
function initResizePage() {
    const widthField = document.querySelector('#width')
    const heightField = document.querySelector('#height')
    const heightRange = document.querySelector('#height_range')
    const widthRange = document.querySelector('#width_range')
    const selectFile = document.querySelector('#select_file')
    const selectedImage = document.querySelector('#selected_image')
    const resizeButton = document.querySelector('#resize_button')
    const detectFaces = document.querySelector('#face_detect_checkbox')
    const resultListItemTemplate = document.querySelector('#result_list_item')

    const reader = new FileReader()

    heightRange.addEventListener('input', e => {
        heightField.value = e.target.value
    })

    widthRange.addEventListener('input', e => {
        widthField.value = e.target.value
    })

    selectFile.addEventListener('input', async e => {
        let log = logger.clone('Select file')
        await log.info('running')
        resizeButton.disabled = true

        if(e.target.files.length > 0){
            let imageFile = e.target.files[0]
            reader.readAsDataURL(imageFile)
            resizeButton.disabled = false
        }

    })

    reader.addEventListener('load', () => {
        selectedImage.src = reader.result
    }, false)


    resizeButton.addEventListener('click', async e => {
        let log = logger.clone('Resize action')
        await log.info('running')

        const resultListContainer = document.querySelector('#result_list_container')
        const resultList = document.createElement('ul')
        resultList.classList.add('navbar-dark', 'list-unstyled', 'results-list')

        const formData = new FormData()
        formData.append('image', selectFile.files[0])
        formData.append('height', heightField.value)
        formData.append('width', widthField.value)
        formData.append('detect', detectFaces.checked)
        toggleSpinner()
        await fetch('/api/data/resizeImage', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData,
        }).then(res => {
            if (res.status === 401) {
                logout()
                return null
            }
            if (res.status === 404) return null
            return res
        }).then(res => res.json())
            .then(res => {
                if (res) {
                    //create,insert list items
                    res.forEach(path => {
                        const resultListItem = resultListItemTemplate.content.cloneNode(true).firstElementChild
                        resultListItem.firstElementChild.lastElementChild.href = path
                        resultListItem.firstElementChild.firstElementChild.src = path
                        resultList.appendChild(resultListItem)
                    })

                    toggleSpinner()
                    showOkBlocking()
                    window.scrollTo({ left: 0, top: document.body.scrollHeight - 50, behavior: 'smooth' })
                }
                else toggleSpinner()
            })
            .catch(async err => {
                await log.error(err)
                toggleSpinner()
            })



        ///create form data ,send on server, get array of paths, for each create li element,set src for  download
        resultListContainer.innerHTML = resultList.outerHTML
    })

}







//----------- Helpers ------------------

function convertToTimeString(secs) {
    let hours = secs / 3600
    let minutes = (hours % 1) * 60
    let seconds = (minutes % 1) * 60
    hours = Math.floor(hours)
    minutes = Math.floor(minutes)
    seconds = Math.floor(seconds)

    return `${(hours > 0) ? `${hours}h` : ''} ` +
        `${(minutes > 0) ? `${minutes}m` : ''} ` +
        `${seconds}s`
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
    let res = 'nouser'
    decoded.split(';').forEach(el => {
        if (el.startsWith(prefName)) {
            res = el.substring(prefName.length)
        }
    })
    return res
}
