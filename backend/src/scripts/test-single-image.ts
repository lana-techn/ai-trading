/**
 * Quick test script for single image analysis
 */

import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AgentRouterService } from '../modules/ai/services/agent-router.service';

async function testSingleImage() {
  console.log('🚀 Testing Single Chart Image Analysis\n');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const agentRouter = app.get(AgentRouterService);

    // Test with first BTC image
    const imagePath = path.join(__dirname, '../../../assets/example-01-BTC.png');
    
    console.log(`📁 Image: ${imagePath}\n`);

    if (!fs.existsSync(imagePath)) {
      console.log(`❌ File not found: ${imagePath}`);
      process.exit(1);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const mimeType = 'image/png';
    
    console.log(`✓ Image loaded: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`✓ MIME type: ${mimeType}`);
    console.log('\n🤖 Analyzing with AI Vision...\n');

    const startTime = Date.now();
    const result = await agentRouter.analyzeChartImage(
      imageBuffer,
      mimeType,
      'Analyze this Bitcoin trading chart in detail',
    );
    const duration = Date.now() - startTime;

    console.log(`⏱️  Completed in ${duration}ms\n`);

    if (result.success) {
      console.log('✅ SUCCESS\n');
      console.log(`📈 Symbol: ${result.symbolDetected || 'N/A'}`);
      console.log(`⏰ Timeframe: ${result.timeframeDetected || 'N/A'}`);
      console.log(`🎯 Signal: ${result.tradingSignal || 'N/A'}`);
      console.log(`💯 Confidence: ${result.confidence || 'N/A'}%`);
      
      if (result.keyInsights && result.keyInsights.length > 0) {
        console.log('\n💡 Key Insights:');
        result.keyInsights.forEach((insight: string, i: number) => {
          console.log(`   ${i + 1}. ${insight}`);
        });
      }

      console.log('\n📝 Full Analysis:');
      console.log('-'.repeat(80));
      console.log(result.analysis);
      console.log('-'.repeat(80));
    } else {
      console.log('❌ FAILED');
      console.log(`Error: ${result.error}`);
    }

    await app.close();
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testSingleImage();
