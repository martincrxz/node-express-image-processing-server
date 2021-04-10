const { Router, request } = require('express')
const multer = require('multer')
const path = require('path')
const imageProcessor = require('./imageProcessor')

const router = Router()

function filename(req, file, cb) {
    cb(null, file.originalname)
}

const storage = multer.diskStorage({
    destination: 'api/uploads/',
    filename
})

function fileFilter(req, file, cb) {
    if (file.mimetype !== 'image/png') {
        req.fileValidationError = 'Wrong file type'
        cb(null, false, new Error('Wrong file type'))
    } else {
        cb(null, true)
    }
}

const upload = multer({
    fileFilter,
    storage
})

router.post('/upload', upload.single('photo'), async function(request, response) {
    if (request.fileValidationError) {
        return response.status(400).json({
            error: request.fileValidationError
        });
    }

    try {
        await imageProcessor(request.file.filename)
    } catch(error) {

    }

    return response.status(201).json({success: true});
})

const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html')
router.get('/photo-viewer', function(req, res){
    res.sendFile(photoPath)
})

module.exports = router