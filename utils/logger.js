

class Log {
    methodName = ''

    constructor(methodName = ''){
        this.methodName = methodName
    }

    error(subject){
        console.log(`[-ERROR-] in (${this.methodName}):: ${subject}`)
    }

    info(subject){
        console.log(`[-INFO-] from (${this.methodName}):: ${subject}`)
    }

}

module.exports = Log