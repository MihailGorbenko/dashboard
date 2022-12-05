

 async function test() {

    let user = {
        email : 'goma@gmail.com',
        password: '12345',
        profileName: '@gomagne'
       
    }

    
       let response = await fetch('/api/auth/isProfileNameAvailable',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })

    }

test()
