#!/usr/bin/env python3
"""
Apply database schema directly to Supabase using psql connection
"""
import os
import sys
import subprocess
from pathlib import Path

def load_env():
    """Load environment variables from backend/.env"""
    backend_path = Path(__file__).parent.parent / "backend"
    env_path = backend_path / ".env"
    env_vars = {}
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key] = value
                    os.environ[key] = value
    
    return env_vars

def get_db_connection_string():
    """Convert Supabase URL to PostgreSQL connection string"""
    url = os.getenv('SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    
    # Extract project reference from URL
    # https://fciejdzjuvdlurkdpgla.supabase.co -> fciejdzjuvdlurkdpgla
    project_ref = url.replace('https://', '').replace('.supabase.co', '')
    
    # Supabase database connection format
    # For direct SQL execution, we need the database password
    # This is usually available in the project settings
    
    # For now, we'll provide manual instructions since we don't have the DB password
    return project_ref, None

def apply_schema_via_supabase_dashboard():
    """Provide instructions for manual schema application"""
    schema_path = Path(__file__).parent.parent / "database" / "schema.sql"
    
    if not schema_path.exists():
        print("❌ Schema file not found!")
        return False
    
    project_ref, _ = get_db_connection_string()
    
    print("🚀 Applying database schema to Supabase...")
    print()
    print("Since direct PostgreSQL access requires the database password,")
    print("please follow these steps to apply the schema manually:")
    print()
    print("1. 📋 Copy the schema to clipboard:")
    
    # Copy to clipboard if possible
    try:
        with open(schema_path, 'r') as f:
            schema_content = f.read()
        
        # Try to copy to clipboard on macOS
        if sys.platform == "darwin":
            process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE, text=True)
            process.communicate(schema_content)
            print("   ✅ Schema copied to clipboard!")
        else:
            print(f"   📄 Please copy content from: {schema_path}")
    except Exception as e:
        print(f"   📄 Please copy content from: {schema_path}")
    
    print()
    print("2. 🌐 Open Supabase Dashboard:")
    print(f"   https://supabase.com/dashboard/project/{project_ref}")
    print()
    print("3. 📝 Execute the schema:")
    print("   - Click 'SQL Editor' in the left sidebar")
    print("   - Click 'New query' button")
    print("   - Paste the schema content")
    print("   - Click 'RUN' button")
    print()
    print("4. ✅ Verify tables were created:")
    print("   - Go to 'Table Editor' in the sidebar")
    print("   - You should see these tables:")
    
    expected_tables = [
        "profiles", "uploaded_images", "chat_sessions", 
        "chat_messages", "user_watchlists", "portfolio_holdings"
    ]
    
    for table in expected_tables:
        print(f"     • {table}")
    
    print()
    print("5. 🧪 Test the implementation:")
    print("   - Start development server: ./dev.sh")
    print("   - Visit: http://localhost:3000/test")
    print("   - Try uploading an image")
    
    return True

def main():
    """Main function"""
    try:
        # Load environment
        env_vars = load_env()
        print(f"📁 Loaded {len(env_vars)} environment variables")
        
        # Apply schema
        success = apply_schema_via_supabase_dashboard()
        
        if success:
            print()
            print("🎉 Ready to apply schema! Follow the instructions above.")
        else:
            print("❌ Setup failed. Check the error messages above.")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()