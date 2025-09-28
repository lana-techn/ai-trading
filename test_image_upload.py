#!/usr/bin/env python3
"""
Test script for image upload and analysis functionality
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.append(str(backend_path))

async def test_image_analysis_service():
    """Test the image analysis service functionality"""
    
    try:
        from app.services.image_analysis import image_analysis_service
        
        print("🧪 Testing Image Analysis Service...")
        
        # Initialize the service
        await image_analysis_service.initialize()
        print("✅ Service initialized successfully")
        
        # Test upload directory creation
        upload_dir = image_analysis_service.upload_dir
        if upload_dir.exists():
            print(f"✅ Upload directory exists: {upload_dir}")
        else:
            print(f"❌ Upload directory missing: {upload_dir}")
            
        # Test prompt generation
        prompt = image_analysis_service.create_chart_analysis_prompt("Test context")
        print(f"✅ Generated analysis prompt ({len(prompt)} characters)")
        
        print("\n🎉 All tests passed!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure all dependencies are installed:")
        print("pip install -r backend/requirements.txt")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_api_endpoints():
    """Test API endpoint accessibility"""
    
    try:
        import requests
        
        print("\n🌐 Testing API Endpoints...")
        
        # Test health check
        try:
            response = requests.get("http://localhost:8000/api/v1/health", timeout=5)
            if response.status_code == 200:
                print("✅ Health check endpoint accessible")
            else:
                print(f"⚠️  Health check returned status {response.status_code}")
        except requests.exceptions.ConnectionError:
            print("⚠️  API server not running (this is expected if not started)")
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            
    except ImportError:
        print("❌ requests library not available")

def main():
    """Main test function"""
    print("🚀 Testing Image Upload and Analysis System\n")
    
    # Run async tests
    asyncio.run(test_image_analysis_service())
    asyncio.run(test_api_endpoints())
    
    print("\n📝 To test the full system:")
    print("1. Start the backend server: cd backend && python -m uvicorn app.main:app --reload")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Navigate to the chat page and try uploading a chart image")

if __name__ == "__main__":
    main()