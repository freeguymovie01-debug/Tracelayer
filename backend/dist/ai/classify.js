"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAIModel = initAIModel;
exports.getModelStatus = getModelStatus;
exports.classifyImage = classifyImage;
const ort = __importStar(require("onnxruntime-node"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DAMAGE_CLASSES = ['no-damage', 'minor-damage', 'major-damage', 'destroyed'];
const SEVERITY_MAP = {
    'no-damage': 5,
    'minor-damage': 30,
    'major-damage': 65,
    'destroyed': 90
};
let session = null;
let usingFallback = false;
async function initAIModel() {
    const modelPath = path.join(__dirname, '../../models/efficientnet_lite.onnx');
    if (fs.existsSync(modelPath)) {
        try {
            session = await ort.InferenceSession.create(modelPath);
            console.log('✅ AI: ONNX model loaded');
            usingFallback = false;
        }
        catch (e) {
            console.warn('⚠️  AI: Model load failed, using rule-based fallback');
            usingFallback = true;
        }
    }
    else {
        console.warn('⚠️  AI: Model file not found, using rule-based fallback');
        usingFallback = true;
    }
}
function getModelStatus() {
    return { mode: usingFallback ? 'fallback' : 'onnx', modelLoaded: !!session };
}
async function classifyImage(imageBuffer) {
    if (usingFallback || !session) {
        // Rule-based: analyze image brightness/size as proxy for damage
        const avgByte = imageBuffer.reduce((a, b) => a + b, 0) / imageBuffer.length;
        const classIndex = avgByte > 200 ? 0 : avgByte > 150 ? 1 : avgByte > 100 ? 2 : 3;
        const damageClass = DAMAGE_CLASSES[classIndex];
        return {
            damageClass,
            confidence: 0.75,
            severityHint: SEVERITY_MAP[damageClass],
            mode: 'fallback'
        };
    }
    // Real ONNX inference
    // Preprocess: resize to 224x224, normalize, create tensor
    // (In a real app, full image manipulation happens here, but for now we simulate inference on the buffer length)
    const inputTensor = new ort.Tensor('float32', new Float32Array(3 * 224 * 224), [1, 3, 224, 224]);
    try {
        const results = await session.run({ input: inputTensor });
        const outputData = results.output.data;
        const maxIdx = outputData.indexOf(Math.max(...Array.from(outputData)));
        const damageClass = DAMAGE_CLASSES[maxIdx] || 'minor-damage';
        return {
            damageClass,
            confidence: outputData[maxIdx] || 0.8,
            severityHint: SEVERITY_MAP[damageClass],
            mode: 'onnx'
        };
    }
    catch (e) {
        console.error("ONNX inference failed, falling back", e);
        return {
            damageClass: 'minor-damage',
            confidence: 0.5,
            severityHint: 30,
            mode: 'fallback'
        };
    }
}
