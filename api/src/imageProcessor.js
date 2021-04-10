const path = require('path')
const { Worker, isMainThread } = require('worker_threads')

const resizeWorkerPath = path.resolve(__dirname, 'resizeWorker.js')
const monochromeWorkerPath = path.resolve(__dirname, 'monochromeWorker.js')

function uploadPathResolver(filename) {
    return path.resolve(__dirname, '../uploads', filename)
}

function imageProcessor(filename) {
    const sourcePath = uploadPathResolver(filename)
    const resizeDestination = uploadPathResolver('resized-' + filename)
    const monochromeDestination = uploadPathResolver('monochrome-' + filename)

    let resizeWorkerFinished = false
    let monochromeWorkerFinished = false

    return new Promise(function(resolve, reject) {
        if (!isMainThread) {
            reject(new Error("not on main thread"))
        } else {
            try {
                const resizeWorker = new Worker(resizeWorkerPath, {
                    workerData: {source: sourcePath, destination: resizeDestination}
                })

                const monochromeWorker = new Worker(monochromeWorkerPath, {
                    workerData: {source: sourcePath, destination: monochromeDestination}
                })

                resizeWorker.on('message', function(message) {
                    resizeWorkerFinished = true
                    if (monochromeWorkerFinished) {
                        resolve('resizeWorker finished processing')
                    }
                })

                resizeWorker.on('error', function(error) {
                    reject(new Error(error.message))
                })

                resizeWorker.on('exit', function(code) {
                    if (code !== 0) {
                        reject(new Error('exited with status code ' + code))
                    }
                })

                monochromeWorker.on('message', function(message) {
                    monochromeWorkerFinished = true
                    if (resizeWorkerFinished) {
                        resolve('monochromeWorker finished processing')
                    }
                })

                monochromeWorker.on('error', function(error) {
                    reject(new Error(error.message))
                })

                monochromeWorker.on('exit', function(code) {
                    if (code !== 0) {
                        reject(new Error('exited with status code ' + code))
                    }
                })
            } catch (error) {
                reject(error)
            }
        }
    })
}

module.exports = imageProcessor