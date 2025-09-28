#!/usr/bin/env python3
"""
Quick test for the image upload endpoint
"""

import requests
import io
from PIL import Image

def create_test_image():
    """Create a simple test image"""
    # Create a small test image
    img = Image.new('RGB', (300, 200), color='blue')
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    return img_buffer

def test_image_upload():
    """Test the image upload endpoint"""
    
    url = "http://localhost:8000/api/v1/chat/upload-image"
    
    # Create test image
    test_image = create_test_image()
    
    # Prepare files and data for upload
    files = {
        'file': ('test_chart.png', test_image, 'image/png')
    }
    
    data = {
        'session_id': 'test_session',
        'additional_context': 'This is a test chart for verification'
    }
    
    try:
        print("📤 Testing image upload endpoint...")
        print(f"URL: {url}")
        
        response = requests.post(url, files=files, data=data, timeout=60)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Upload successful!")
            print(f"Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
            print(f"Image filename: {result.get('image_filename')}")
            
            if result.get('analysis'):
                analysis = result['analysis']
                print(f"\n🤖 AI Analysis:")
                print(f"- Signal: {analysis.get('trading_signal', 'N/A')}")
                print(f"- Confidence: {analysis.get('confidence_score', 0):.2f}")
                print(f"- Processing time: {analysis.get('processing_time_ms', 0)}ms")
                
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Is the server running?")
        print("Start with: cd backend && python3 minimal_server.py")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing Image Upload Endpoint")
    print("=" * 40)
    test_image_upload()