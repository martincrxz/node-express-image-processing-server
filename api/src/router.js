const { Router, request } = require('express')
const multer = require('multer')

const router = Router()

function filename(req, file, cb) {
    cb(null, file.originalname)
}

const storage = multer.diskStorage({
    destination: 'api/uploads/',
    filename: filename
})

function fileFilter(req, file, cb) {
    if (file.mimetype != 'image/png') {
        request.fileValidationError = 'Wrong file type'
        cb(null, false, new Error('Wrong file type'))
    } else {
        cb(null, true)
    }
}

const upload = multer({
    fileFilter: fileFilter,
    storage: storage
})

router.post('/upload', upload.single('photo'), function(req, res) {
    if ('fileValidationError' in req) {
        return res.status(400).json({
            error: req.fileValidationError
        })
    }
    return res.status(201).json({
        success: true
    })
})

module.exports = router