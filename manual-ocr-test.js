import { createWorker } from 'tesseract.js';
import fs from 'fs';

const testImages = [
    './detection/psa_card.jpg',
    './detection/labels.jpg', 
    './detection/english_pokemon.png',
    './detection/japanese_pokemon.png',
    './detection/english_pokemon2.png'
];

async function testOCR() {
    console.log('🚀 Starting OCR Tests');
    console.log('====================');
    
    const results = [];
    
    // Initialize Tesseract worker
    const worker = await createWorker('eng', 1, {
        logger: m => console.log(`[Tesseract] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });
    
    for (const imagePath of testImages) {
        try {
            console.log(`\n📸 Testing: ${imagePath}`);
            
            // Check if file exists
            if (!fs.existsSync(imagePath)) {
                console.log(`❌ File not found: ${imagePath}`);
                continue;
            }
            
            const startTime = Date.now();
            const { data: { text, confidence } } = await worker.recognize(imagePath, {
                rotateAuto: true
            });
            const endTime = Date.now();
            
            const result = {
                image: imagePath,
                success: true,
                text: text.trim(),
                confidence: Math.round(confidence),
                processingTime: endTime - startTime
            };
            
            results.push(result);
            
            console.log(`✅ Success: ${result.processingTime}ms, Confidence: ${result.confidence}%`);
            console.log(`📝 Text (first 200 chars): ${result.text.substring(0, 200)}...`);
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            results.push({
                image: imagePath,
                success: false,
                error: error.message
            });
        }
    }
    
    await worker.terminate();
    
    // Save results
    const output = {
        timestamp: new Date().toISOString(),
        totalImages: testImages.length,
        results: results,
        summary: {
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length,
            avgProcessingTime: Math.round(results.filter(r => r.success).reduce((sum, r) => sum + r.processingTime, 0) / results.filter(r => r.success).length),
            avgConfidence: Math.round(results.filter(r => r.success).reduce((sum, r) => sum + r.confidence, 0) / results.filter(r => r.success).length)
        }
    };
    
    fs.writeFileSync('./src/tests/ocr-test-results.json', JSON.stringify(output, null, 2));
    
    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`✅ Successful: ${output.summary.successCount}/${testImages.length}`);
    console.log(`❌ Failed: ${output.summary.failureCount}/${testImages.length}`);
    console.log(`⏱️ Avg Processing Time: ${output.summary.avgProcessingTime}ms`);
    console.log(`📈 Avg Confidence: ${output.summary.avgConfidence}%`);
    console.log(`💾 Results saved to: ./src/tests/ocr-test-results.json`);
    
    return output;
}

testOCR().catch(console.error);