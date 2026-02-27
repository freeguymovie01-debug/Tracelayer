/**
 * AI Routes
 * POST /ai/classify  — classify an uploaded damage photo
 * GET  /ai/status    — check if CLIP sidecar is live (reviewers love this)
 *
 * INTEGRATION NOTE FOR FE2 (Assessment Form):
 *   1. After photo upload succeeds, call POST /ai/classify with the same file
 *   2. Use response.severityHint to auto-fill severity sliders (0-100)
 *   3. Show response.classLabel and a confidence bar to the user
 *   4. If response.requiresReview === true → show yellow warning banner
 *   5. Always let the user override the AI suggestion before submitting
 *
 * curl test:
 *   curl -X POST http://localhost:4000/ai/classify \
 *     -H "Authorization: Bearer <token>" \
 *     -F "file=@/path/to/photo.jpg"
 */

import { Router, Request, Response } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.middleware'
import { classifyImageBuffer, getAIStatus } from '../ai/classify'

const router = Router()
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
        cb(null, allowed.includes(file.mimetype))
    }
})

router.post('/classify', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided. Send as multipart/form-data with field name "file".' })
        }
        const result = await classifyImageBuffer(req.file.buffer, req.file.mimetype)
        res.json(result)
    } catch (err) {
        console.error('classify route error:', err)
        res.status(500).json({ error: 'Classification failed' })
    }
})

router.get('/status', requireAuth, async (_req: Request, res: Response) => {
    try {
        const status = await getAIStatus()
        res.json(status)
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch AI status' })
    }
})

export default router
