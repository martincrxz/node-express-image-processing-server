const { Router, request } = require('express')
const multer = require('multer')
const path = require('path')

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

router.post('/upload', upload.single('photo'), function(request, response) {
    if (request.fileValidationError) {
        return response.status(400).json({
            error: request.fileValidationError
        });
    }

    return response.status(201).json({success: true});
})

const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html')
router.get('/photo-viewer', function(req, res){
    res.sendFile(photoPath)
})

module.exports = router