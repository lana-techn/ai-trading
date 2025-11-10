/**
 * Test script for chart image analysis using Gemini Vision
 * 
 * This script tests the image analysis functionality by analyzing
 * sample chart images from the assets folder.
 * 
 * Usage:
 *   npm run build
 *   node dist/scripts/test-image-analysis.js
 * 
 * Or with ts-node:
 *   npx ts-node src/scripts/test-image-analysis.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AgentRouterService } from '../modules/ai/services/agent-router.service';

async function testImageAnalysis() {
  console.log('🚀 Starting Chart Image Analysis Test\n');
  
  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const agentRouter = app.get(AgentRouterService);

    // Path to assets folder (from backend/dist/scripts/ to assets/)
    const assetsPath = path.join(__dirname, '../../../assets');
    
    // List of test images
    const testImages = [
      'example-01-BTC.png',
      'example-02-BTC.png',
      'example-04.AAPL.png',
    ];

    console.log(`📁 Assets folder: ${assetsPath}\n`);

    for (const imageName of testImages) {
      const imagePath = path.join(assetsPath, imageName);
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 Analyzing: ${imageName}`);
      console.log(`${'='.repeat(80)}\n`);

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`❌ File not found: ${imagePath}`);
        continue;
      }

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const mimeType = 'image/png';
      
      console.log(`✓ Image loaded: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
      console.log(`✓ MIME type: ${mimeType}`);
      console.log('\n🤖 Sending to Gemini Vision (with Qwen fallback if needed)...\n');

      // Perform analysis using AgentRouter (will use Gemini Vision first, Qwen as fallback)
      const startTime = Date.now();
      const result = await agentRouter.analyzeChartImage(
        imageBuffer,
        mimeType,
        `Analyze this ${imageName.includes('BTC') ? 'Bitcoin' : 'stock'} chart`,
      );
      const duration = Date.now() - startTime;

      console.log(`⏱️  Analysis completed in ${duration}ms\n`);

      if (result.success) {
        console.log('✅ ANALYSIS SUCCESSFUL\n');
        
        if (result.symbolDetected) {
          console.log(`📈 Symbol Detected: ${result.symbolDetected}`);
        }
        
        if (result.timeframeDetected) {
          console.log(`⏰ Timeframe: ${result.timeframeDetected}`);
        }
        
        if (result.tradingSignal) {
          console.log(`\n🎯 Trading Signal: ${result.tradingSignal}`);
        }
        
        if (result.confidence) {
          console.log(`💯 Confidence: ${result.confidence}%`);
        }

        if (result.technicalIndicators) {
          console.log('\n📊 Technical Indicators:');
          if (result.technicalIndicators.trend) {
            console.log(`   • Trend: ${result.technicalIndicators.trend}`);
          }
          if (result.technicalIndicators.patterns && result.technicalIndicators.patterns.length > 0) {
            console.log(`   • Patterns: ${result.technicalIndicators.patterns.join(', ')}`);
          }
          if (result.technicalIndicators.support && result.technicalIndicators.support.length > 0) {
            console.log(`   • Support: ${result.technicalIndicators.support.join(', ')}`);
          }
          if (result.technicalIndicators.resistance && result.technicalIndicators.resistance.length > 0) {
            console.log(`   • Resistance: ${result.technicalIndicators.resistance.join(', ')}`);
          }
        }

        if (result.keyInsights && result.keyInsights.length > 0) {
          console.log('\n💡 Key Insights:');
          result.keyInsights.forEach((insight: string, index: number) => {
            console.log(`   ${index + 1}. ${insight}`);
          });
        }

        console.log('\n📝 Full Analysis:');
        console.log('-'.repeat(80));
        console.log(result.analysis);
        console.log('-'.repeat(80));

      } else {
        console.log('❌ ANALYSIS FAILED\n');
        console.log(`Error: ${result.error}`);
      }

      // Wait a bit between requests to avoid rate limiting
      if (testImages.indexOf(imageName) < testImages.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next analysis...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('✅ All tests completed!');
    console.log('='.repeat(80) + '\n');

    await app.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
testImageAnalysis();
