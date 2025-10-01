#!/usr/bin/env python3
"""
Setup Supabase integration for the trader-ai-agent project
"""
import os
from pathlib import Path

def setup_frontend_env():
    """Setup frontend environment variables"""
    backend_env_path = Path(__file__).parent.parent / "backend" / ".env"
    frontend_env_path = Path(__file__).parent.parent / "frontend" / ".env.local"
    
    # Read backend .env
    backend_vars = {}
    if backend_env_path.exists():
        with open(backend_env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    backend_vars[key] = value
    
    # Read existing frontend .env.local or create from example
    if not frontend_env_path.exists():
        example_path = frontend_env_path.parent / ".env.local.example"
        if example_path.exists():
            with open(example_path, 'r') as f:
                content = f.read()
        else:
            content = """# AI Trading Agent Frontend Configuration

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket Configuration (for real-time features)
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_LIVE_TRADING=true
NEXT_PUBLIC_ENABLE_PAPER_TRADING=true

# Analytics (optional)
# NEXT_PUBLIC_GA_ID=
# NEXT_PUBLIC_MIXPANEL_TOKEN=

# Development Settings
NEXT_PUBLIC_DEBUG=true
"""
    else:
        with open(frontend_env_path, 'r') as f:
            content = f.read()
    
    # Add/update Supabase variables
    supabase_vars = {
        'NEXT_PUBLIC_SUPABASE_URL': backend_vars.get('SUPABASE_URL', ''),
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': backend_vars.get('SUPABASE_ANON_KEY', ''),
        'NEXT_PUBLIC_ENABLE_IMAGE_UPLOAD': 'true'
    }
    
    # Update content
    lines = content.split('\\n')
    updated_lines = []
    updated_vars = set()
    
    for line in lines:
        if '=' in line and not line.strip().startswith('#'):
            key = line.split('=')[0].strip()
            if key in supabase_vars:
                updated_lines.append(f"{key}={supabase_vars[key]}")
                updated_vars.add(key)
            else:
                updated_lines.append(line)
        else:
            updated_lines.append(line)
    
    # Add missing variables
    if updated_vars != set(supabase_vars.keys()):
        updated_lines.append("")
        updated_lines.append("# Supabase Configuration")
        for key, value in supabase_vars.items():
            if key not in updated_vars:
                updated_lines.append(f"{key}={value}")
    
    # Write back
    with open(frontend_env_path, 'w') as f:
        f.write('\\n'.join(updated_lines))
    
    return supabase_vars

def main():
    """Main setup function"""
    print("🚀 Setting up Supabase integration...")
    print()
    
    # Setup frontend environment
    supabase_vars = setup_frontend_env()
    print("✅ Frontend environment configured")
    print(f"   - SUPABASE_URL: {supabase_vars['NEXT_PUBLIC_SUPABASE_URL']}")
    print(f"   - Image upload: {supabase_vars['NEXT_PUBLIC_ENABLE_IMAGE_UPLOAD']}")
    print()
    
    # Check schema file
    schema_path = Path(__file__).parent.parent / "database" / "schema.sql"
    if schema_path.exists():
        print("✅ Database schema file found")
        print(f"   - Location: {schema_path}")
    else:
        print("❌ Database schema file not found!")
        return
    
    print()
    print("📋 Manual steps to complete setup:")
    print()
    print("1. Open your Supabase Dashboard:")
    print(f"   https://supabase.com/dashboard/project/{supabase_vars['NEXT_PUBLIC_SUPABASE_URL'].split('//')[1].split('.')[0]}")
    print()
    print("2. Go to SQL Editor:")
    print("   - Click 'SQL Editor' in the left sidebar")
    print("   - Click 'New Query'")
    print()
    print("3. Copy and paste the schema:")
    print(f"   - Open: {schema_path}")
    print("   - Copy the entire content")
    print("   - Paste it in the SQL Editor")
    print("   - Click 'Run' button")
    print()
    print("4. Verify tables were created:")
    print("   - Go to 'Table Editor' in sidebar")
    print("   - You should see: profiles, uploaded_images, chat_sessions, etc.")
    print()
    print("5. Test the implementation:")
    print("   - Start your development servers: ./dev.sh")
    print("   - Visit: http://localhost:3000/test")
    print("   - Try uploading an image")
    print()
    
    # Show schema preview
    print("📄 Database schema preview:")
    print("=" * 50)
    with open(schema_path, 'r') as f:
        lines = f.readlines()
        # Show first 20 lines
        for i, line in enumerate(lines[:20]):
            print(f"{i+1:2d}| {line.rstrip()}")
        if len(lines) > 20:
            print(f"... ({len(lines) - 20} more lines)")
    print("=" * 50)
    print()
    
    print("🎉 Setup complete! Follow the manual steps above to finish.")

if __name__ == "__main__":
    main()