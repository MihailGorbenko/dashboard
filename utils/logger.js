

class Log {
    methodName = ''

    constructor(methodName = ''){
        this.methodName = methodName
    }

    error(subject){
        console.log(`[-SERVER ERROR-] in (${this.methodName}):: ${subject}`)
    }

    info(subject){
        console.log(`[-SERVER INFO-] from (${this.methodName}):: ${subject}`)
    }

    log(subject) {
        console.log(subject)
        
    }

}

module.exports = Log