 async function testRegister () {
    let user = {
        email : 'gomagle@gmail.com',
        password: '12345'
    }

    
    let response = await fetch('/api/auth/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })

    console.log(response);
 }

 testRegister()
