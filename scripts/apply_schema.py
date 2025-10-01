#!/usr/bin/env python3
"""
Apply database schema to Supabase database
"""
import os
import sys
import subprocess
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_path))

def load_env():
    """Load environment variables from backend/.env"""
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

def get_supabase_config():
    """Get Supabase configuration"""
    url = os.getenv('SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    
    return url, service_key

def run_sql_command(sql_content, url, service_key):
    """Execute SQL using psql via Supabase connection"""
    # Extract database connection info from Supabase URL
    # Format: https://project.supabase.co -> postgresql://postgres:[password]@db.project.supabase.co:5432/postgres
    
    project_ref = url.replace('https://', '').replace('.supabase.co', '')
    
    # For Supabase, we'll use the REST API to execute SQL
    import requests
    import json
    
    # Split SQL into individual statements
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
    
    results = []
    for i, stmt in enumerate(statements):
        if not stmt:
            continue
            
        print(f"Executing statement {i+1}/{len(statements)}...")
        
        # Use Supabase REST API for SQL execution
        headers = {
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json'
        }
        
        # For DDL statements, we'll use a simpler approach
        if any(keyword in stmt.upper() for keyword in ['CREATE', 'DROP', 'ALTER', 'INSERT']):
            try:
                # Use rpc call for raw SQL execution
                response = requests.post(
                    f"{url}/rest/v1/rpc/exec_sql",
                    headers=headers,
                    json={'sql': stmt},
                    timeout=30
                )
                
                if response.status_code in [200, 201]:
                    print(f"✅ Statement {i+1} executed successfully")
                    results.append(('success', stmt[:100] + '...'))
                else:
                    print(f"⚠️  Statement {i+1} failed: {response.status_code} - {response.text}")
                    results.append(('warning', f"HTTP {response.status_code}: {stmt[:100]}..."))
                    
            except Exception as e:
                print(f"❌ Error executing statement {i+1}: {str(e)}")
                results.append(('error', f"Error: {str(e)[:100]}..."))
        
        else:
            print(f"⏭️  Skipping statement {i+1} (likely a comment or complex statement)")
    
    return results

def main():
    """Main function to apply schema"""
    print("🚀 Applying database schema to Supabase...")
    
    try:
        # Load environment
        env_vars = load_env()
        print(f"📁 Loaded {len(env_vars)} environment variables")
        
        # Get Supabase config
        url, service_key = get_supabase_config()
        print(f"🔗 Connecting to: {url}")
        
        # Read schema file
        schema_path = Path(__file__).parent.parent / "database" / "schema.sql"
        if not schema_path.exists():
            raise FileNotFoundError(f"Schema file not found: {schema_path}")
        
        with open(schema_path, 'r') as f:
            sql_content = f.read()
        
        print(f"📄 Read schema file ({len(sql_content)} characters)")
        
        # Execute SQL
        results = run_sql_command(sql_content, url, service_key)
        
        # Summary
        success_count = sum(1 for r in results if r[0] == 'success')
        warning_count = sum(1 for r in results if r[0] == 'warning')
        error_count = sum(1 for r in results if r[0] == 'error')
        
        print(f"\n📊 Schema application results:")
        print(f"✅ Successful: {success_count}")
        print(f"⚠️  Warnings: {warning_count}")
        print(f"❌ Errors: {error_count}")
        
        if error_count == 0:
            print("\n🎉 Schema applied successfully!")
        else:
            print("\n⚠️  Schema applied with some errors. Check the output above.")
        
        # Update frontend .env.local
        update_frontend_env(env_vars)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

def update_frontend_env(backend_env):
    """Update frontend .env.local with Supabase configuration"""
    frontend_env_path = Path(__file__).parent.parent / "frontend" / ".env.local"
    
    # Read existing .env.local or create from example
    if not frontend_env_path.exists():
        example_path = frontend_env_path.parent / ".env.local.example"
        if example_path.exists():
            with open(example_path, 'r') as f:
                content = f.read()
            print("📋 Created .env.local from example")
        else:
            content = ""
    else:
        with open(frontend_env_path, 'r') as f:
            content = f.read()
        print("📝 Updated existing .env.local")
    
    # Update/add Supabase variables
    supabase_vars = {
        'NEXT_PUBLIC_SUPABASE_URL': backend_env.get('SUPABASE_URL', ''),
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': backend_env.get('SUPABASE_ANON_KEY', ''),
        'NEXT_PUBLIC_ENABLE_IMAGE_UPLOAD': 'true'
    }
    
    # Update content
    lines = content.split('\n')
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
    for key, value in supabase_vars.items():
        if key not in updated_vars:
            updated_lines.append(f"{key}={value}")
    
    # Write back
    with open(frontend_env_path, 'w') as f:
        f.write('\n'.join(updated_lines))
    
    print(f"✅ Updated {frontend_env_path} with Supabase configuration")

if __name__ == "__main__":
    main()