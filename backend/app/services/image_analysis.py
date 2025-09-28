"""
Image Analysis Service for Chart Analysis
Handles image uploads, validation, and analysis using Gemini Vision API
"""

import os
import time
import uuid
import asyncio
from io import BytesIO
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
from pathlib import Path

import google.generativeai as genai
from PIL import Image
import aiofiles
from fastapi import UploadFile, HTTPException

from app.core.config import settings, get_ai_config
from app.utils.logger import get_logger
from app.models.models import ImageAnalysis, TradingSignal, AnalysisType

logger = get_logger(__name__)

class ImageAnalysisService:
    """Service for handling image upload and chart analysis."""
    
    def __init__(self):
        self.config = get_ai_config()
        self.gemini_model = None
        self.upload_dir = Path("uploads/images")
        self.supported_formats = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self._initialized = False
        
        # Ensure upload directory exists
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    async def initialize(self):
        """Initialize the image analysis service."""
        if self._initialized:
            return
        
        try:
            if self.config["gemini_api_key"]:
                genai.configure(api_key=self.config["gemini_api_key"])
                # Use Gemini Vision model for image analysis
                self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
                logger.info("Image analysis service initialized with Gemini Vision")
            else:
                logger.warning("Gemini API key not available for image analysis")
                raise ValueError("Gemini API key required for image analysis")
            
            self._initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize image analysis service: {e}")
            self._initialized = False
            raise
    
    async def validate_image(self, file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded image file."""
        
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in self.supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format. Supported: {', '.join(self.supported_formats)}"
            )
        
        # Read file content to check size and validity
        content = await file.read()
        await file.seek(0)  # Reset file pointer
        
        # Check file size
        if len(content) > self.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB"
            )
        
        # Validate image format by trying to open it
        try:
            image = Image.open(BytesIO(content))
            image.verify()  # Verify it's a valid image
            
            # Get image dimensions
            image = Image.open(BytesIO(content))  # Reload after verify
            width, height = image.size
            
            return {
                "valid": True,
                "size": len(content),
                "dimensions": {"width": width, "height": height},
                "format": image.format,
                "mode": image.mode
            }
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
    
    async def save_image(self, file: UploadFile) -> Tuple[str, str]:
        """Save uploaded image and return filename and path."""
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        file_path = self.upload_dir / unique_filename
        
        try:
            # Save file
            content = await file.read()
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(content)
            
            logger.info(f"Image saved: {unique_filename} ({len(content)} bytes)")
            return unique_filename, str(file_path)
            
        except Exception as e:
            logger.error(f"Failed to save image: {e}")
            # Clean up if file was partially created
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save image: {str(e)}"
            )
    
    def create_chart_analysis_prompt(self, additional_context: str = "") -> str:
        """Create comprehensive prompt for chart analysis."""
        
        prompt = f"""You are an expert trading chart analyst. Analyze this trading chart image and provide detailed insights.

ANALYSIS REQUIREMENTS:
1. Identify the trading symbol and timeframe if visible
2. Analyze price action, trends, and patterns
3. Identify technical indicators present (RSI, MACD, moving averages, etc.)
4. Determine support and resistance levels
5. Assess current market momentum and sentiment
6. Provide trading signal recommendation
7. Evaluate risk factors and potential price targets

ADDITIONAL CONTEXT: {additional_context}

FORMAT YOUR RESPONSE AS JSON:
{{
    "symbol_detected": "BTC/USD or null if not visible",
    "timeframe_detected": "4h or null if not visible", 
    "trading_signal": "STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL",
    "confidence_score": 0.85,
    "analysis_summary": "Brief 2-3 sentence summary of your analysis",
    "detailed_analysis": "Comprehensive analysis of the chart with specific observations",
    "key_insights": [
        "Most important insight 1",
        "Most important insight 2", 
        "Most important insight 3"
    ],
    "technical_indicators": {{
        "rsi": "Overbought/Oversold/Neutral or null",
        "macd": "Bullish/Bearish/Neutral or null",
        "moving_averages": "Above/Below/Mixed or null",
        "volume": "High/Low/Normal or null",
        "other_indicators": ["Any other indicators you can identify"]
    }},
    "support_levels": [45000, 42000],
    "resistance_levels": [48000, 50000],
    "risk_level": "low|medium|high",
    "risk_factors": [
        "Specific risk factor 1",
        "Specific risk factor 2"
    ],
    "price_target": 52000.0,
    "stop_loss": 44000.0,
    "market_structure": "Bullish/Bearish/Sideways/Consolidation",
    "pattern_detected": "Triangle/Flag/Wedge/Channel/etc or null",
    "volume_analysis": "Volume trend and significance",
    "next_key_levels": "What levels to watch for next moves"
}}

Be specific, objective, and data-driven in your analysis. Focus on actionable insights for traders."""
        
        return prompt
    
    async def analyze_chart_image(
        self, 
        image_path: str, 
        additional_context: str = ""
    ) -> Dict[str, Any]:
        """Analyze trading chart image using Gemini Vision."""
        
        if not self._initialized:
            await self.initialize()
        
        start_time = time.time()
        
        try:
            # Load image for Gemini
            image = Image.open(image_path)
            
            # Create analysis prompt
            prompt = self.create_chart_analysis_prompt(additional_context)
            
            # Generate analysis using Gemini Vision
            logger.info(f"Starting chart analysis for image: {Path(image_path).name}")
            
            response = await asyncio.create_task(
                self._generate_vision_analysis(image, prompt)
            )
            
            if not response:
                raise Exception("No response from Gemini Vision API")
            
            # Parse JSON response
            try:
                import json
                # Clean response if it contains markdown
                clean_response = response
                if '```json' in response:
                    clean_response = response.split('```json')[1].split('```')[0].strip()
                elif '```' in response:
                    clean_response = response.split('```')[1].split('```')[0].strip()
                
                analysis_data = json.loads(clean_response)
                
                processing_time = int((time.time() - start_time) * 1000)
                
                # Add metadata
                analysis_data.update({
                    "processing_time_ms": processing_time,
                    "model_used": "gemini-2.0-flash-exp",
                    "api_version": "v1",
                    "success": True
                })
                
                logger.info(f"Chart analysis completed in {processing_time}ms")
                return analysis_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse analysis response: {e}")
                # Return basic analysis with raw response
                return {
                    "success": False,
                    "error": "Failed to parse AI response",
                    "raw_response": response[:1000],
                    "analysis_summary": "AI analysis completed but response format was invalid",
                    "detailed_analysis": response,
                    "trading_signal": "HOLD",
                    "confidence_score": 0.3,
                    "processing_time_ms": int((time.time() - start_time) * 1000)
                }
        
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            processing_time = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "error": str(e),
                "analysis_summary": f"Analysis failed: {str(e)}",
                "detailed_analysis": "Unable to analyze chart due to technical error",
                "trading_signal": "HOLD",
                "confidence_score": 0.0,
                "processing_time_ms": processing_time
            }
    
    async def _generate_vision_analysis(self, image: Image.Image, prompt: str) -> str:
        """Generate analysis using Gemini Vision model."""
        try:
            response = self.gemini_model.generate_content([prompt, image])
            return response.text
        except Exception as e:
            logger.error(f"Gemini Vision API error: {e}")
            raise
    
    async def create_image_analysis_record(
        self,
        user_id: Optional[int],
        filename: str,
        file_path: str,
        file_size: int,
        mime_type: str,
        analysis_result: Dict[str, Any]
    ) -> ImageAnalysis:
        """Create database record for image analysis."""
        
        # Extract analysis data
        trading_signal = None
        if analysis_result.get("trading_signal"):
            try:
                trading_signal = TradingSignal(analysis_result["trading_signal"])
            except ValueError:
                trading_signal = TradingSignal.HOLD
        
        analysis_record = ImageAnalysis(
            user_id=user_id,
            filename=filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            analysis_type=AnalysisType.CHART_ANALYSIS,
            symbol_detected=analysis_result.get("symbol_detected"),
            timeframe_detected=analysis_result.get("timeframe_detected"),
            trading_signal=trading_signal,
            confidence_score=analysis_result.get("confidence_score", 0.0),
            analysis_summary=analysis_result.get("analysis_summary"),
            detailed_analysis=analysis_result.get("detailed_analysis"),
            key_insights=analysis_result.get("key_insights"),
            technical_indicators=analysis_result.get("technical_indicators"),
            support_levels=analysis_result.get("support_levels"),
            resistance_levels=analysis_result.get("resistance_levels"),
            risk_level=analysis_result.get("risk_level"),
            risk_factors=analysis_result.get("risk_factors"),
            price_target=analysis_result.get("price_target"),
            stop_loss=analysis_result.get("stop_loss"),
            processing_time_ms=analysis_result.get("processing_time_ms"),
            model_used=analysis_result.get("model_used"),
            api_version=analysis_result.get("api_version")
        )
        
        return analysis_record
    
    async def cleanup_old_images(self, days_old: int = 30):
        """Clean up old uploaded images."""
        try:
            cutoff_time = time.time() - (days_old * 24 * 60 * 60)
            
            for image_file in self.upload_dir.glob("*"):
                if image_file.is_file() and image_file.stat().st_mtime < cutoff_time:
                    image_file.unlink()
                    logger.info(f"Cleaned up old image: {image_file.name}")
        
        except Exception as e:
            logger.error(f"Image cleanup failed: {e}")

# Global service instance
image_analysis_service = ImageAnalysisService()