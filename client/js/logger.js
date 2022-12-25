class Loger {
    methodName = ''

    constructor(methodName = '') {
        this.methodName = methodName
    }

    async error(subject) { }

    async info(subject) { }

    setMethodName(name) {
        this.methodName = name
    }

    clone(methodName) { return new Loger(methodName) }

}

class NetworkLoger extends Loger {

    async error(subject) {
        const message = `[-CLIENT ERROR-] in (${this.methodName}):: ${subject}`
        await this.#postLog(message)
        console.log(message)
    }

    async info(subject) {
        const message = `[-CLIENT INFO-] from (${this.methodName}):: ${subject}`
        await this.#postLog(message)
        console.log(message)
    }

    async #postLog(message) {
        const logMessage = {
            logMessage: message
        }
        await fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logMessage)
        })
    }

    clone(methodName) { return new NetworkLoger(methodName) }

}

class LocalLoger extends Loger {

   async error(subject) {
        const message = `[-CLIENT ERROR-] in (${this.methodName}):: ${subject}`
        console.log(message)
    }

    async info(subject) {
        const message = `[-CLIENT INFO-] from (${this.methodName}):: ${subject}`
        console.log(message)
    }

    clone(methodName) { return new LocalLoger(methodName) }
}


export { NetworkLoger, LocalLoger, Loger }