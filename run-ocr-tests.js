#!/usr/bin/env node

/**
 * OCR Testing Script for Pokemon Collection
 * Tests both Tesseract.js and Google Vision API with 5 test images
 */

const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

const testImages = [
    { name: 'PSA Card', path: './psa_card.jpg', type: 'PSA_LABEL' },
    { name: 'PSA Labels', path: './labels.jpg', type: 'PSA_LABEL' },
    { name: 'English Pokemon', path: './english_pokemon.png', type: 'ENGLISH_POKEMON' },
    { name: 'Japanese Pokemon', path: './japanese_pokemon.png', type: 'JAPANESE_POKEMON' },
    { name: 'English Pokemon 2', path: './english_pokemon2.png', type: 'ENGLISH_POKEMON' }
];

let testResults = [];

async function testWithTesseract(imagePath, imageName) {
    try {
        console.log(`🔍 Testing ${imageName} with Tesseract.js...`);
        const worker = await createWorker('eng', 1, {
            logger: m => console.log(`[Tesseract] ${m.status}: ${m.progress}`)
        });
        
        const startTime = Date.now();
        const { data: { text, confidence } } = await worker.recognize(imagePath, {
            rotateAuto: true
        });
        const endTime = Date.now();
        
        await worker.terminate();
        
        return {
            success: true,
            text: text.trim(),
            confidence: Math.round(confidence),
            processingTime: endTime - startTime,
            method: 'Tesseract.js'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            method: 'Tesseract.js'
        };
    }
}

async function testWithVisionAPI(imagePath, imageName) {
    try {
        console.log(`🔍 Testing ${imageName} with Google Vision API...`);
        const FormData = require('form-data');
        const fetch = require('node-fetch');
        
        const form = new FormData();
        form.append('image', fs.createReadStream(imagePath), imageName);
        
        const startTime = Date.now();
        const response = await fetch('http://localhost:3000/api/ocr/vision', {
            method: 'POST',
            body: form
        });
        const endTime = Date.now();
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        return {
            success: true,
            text: result.text || '',
            confidence: result.confidence || 0,
            processingTime: endTime - startTime,
            method: 'Google Vision API'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            method: 'Google Vision API'
        };
    }
}

async function runImageTest(imageInfo) {
    console.log(`\n📸 Testing: ${imageInfo.name} (${imageInfo.type})`);
    console.log(`📂 Path: ${imageInfo.path}`);
    
    // Check if file exists
    if (!fs.existsSync(imageInfo.path)) {
        console.log(`❌ File not found: ${imageInfo.path}`);
        return null;
    }
    
    const imageResult = {
        image: imageInfo.name,
        type: imageInfo.type,
        path: imageInfo.path,
        tesseract: null,
        vision: null,
        timestamp: new Date().toISOString()
    };

    // Test with Tesseract.js
    imageResult.tesseract = await testWithTesseract(imageInfo.path, imageInfo.name);
    
    if (imageResult.tesseract.success) {
        console.log(`✅ Tesseract Success: ${imageResult.tesseract.processingTime}ms, Confidence: ${imageResult.tesseract.confidence}%`);
        console.log(`📝 Text: ${imageResult.tesseract.text.substring(0, 100)}...`);
    } else {
        console.log(`❌ Tesseract Failed: ${imageResult.tesseract.error}`);
    }

    // Test with Google Vision API
    imageResult.vision = await testWithVisionAPI(imageInfo.path, imageInfo.name);
    
    if (imageResult.vision.success) {
        console.log(`✅ Vision API Success: ${imageResult.vision.processingTime}ms, Confidence: ${imageResult.vision.confidence}%`);
        console.log(`📝 Text: ${imageResult.vision.text.substring(0, 100)}...`);
    } else {
        console.log(`❌ Vision API Failed: ${imageResult.vision.error}`);
    }

    return imageResult;
}

async function runAllTests() {
    console.log('🚀 Starting OCR Testing Framework');
    console.log('==================================');
    
    testResults = [];
    
    // Test each image
    for (const imageInfo of testImages) {
        const result = await runImageTest(imageInfo);
        if (result) {
            testResults.push(result);
        }
    }
    
    // Generate summary
    const tesseractSuccess = testResults.filter(r => r.tesseract?.success).length;
    const visionSuccess = testResults.filter(r => r.vision?.success).length;
    const totalTests = testResults.length;
    
    console.log('\n📊 Test Summary');
    console.log('===============');
    console.log(`📸 Total Images Tested: ${totalTests}`);
    console.log(`✅ Tesseract.js Success: ${tesseractSuccess}/${totalTests}`);
    console.log(`✅ Google Vision API Success: ${visionSuccess}/${totalTests}`);
    console.log(`📈 Overall Success Rate: ${Math.round(((tesseractSuccess + visionSuccess) / (totalTests * 2)) * 100)}%`);
    
    // Save results
    const results = {
        timestamp: new Date().toISOString(),
        totalImages: totalTests,
        results: testResults,
        summary: {
            tesseractSuccess,
            visionSuccess,
            totalSuccessRate: Math.round(((tesseractSuccess + visionSuccess) / (totalTests * 2)) * 100)
        }
    };
    
    const outputPath = './src/tests/ocr-test-results.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);
    
    return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests, testWithTesseract, testWithVisionAPI };