#!/usr/bin/env python3
"""
Script to migrate tutorial content from Markdown files to Supabase database
Run: python scripts/migrate_tutorials.py
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple
import hashlib
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment from {env_path}")
else:
    print(f"⚠️  No .env file found at {env_path}")

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import get_supabase_admin_client

class TutorialMigrator:
    def __init__(self):
        self.supabase = get_supabase_admin_client()
        self.docs_dir = Path(__file__).parent.parent.parent / "docs"
        
        # Tutorial file mappings with metadata
        self.tutorial_files = {
            "TUTORIAL_TRADING_DASAR.md": {
                "title": "Tutorial Trading Dasar",
                "slug": "trading-dasar",
                "description": "Panduan lengkap cara trading yang benar untuk pemula dari nol hingga profitable",
                "category": "Trading Basics",
                "difficulty_level": "beginner",
                "order_index": 1,
                "tags": ["Trading Basics", "Beginner", "Forex", "Stocks"]
            },
            "TUTORIAL_ANALISIS_TEKNIKAL.md": {
                "title": "Tutorial Analisis Teknikal",
                "slug": "analisis-teknikal",
                "description": "Panduan lengkap cara membaca chart dan indikator trading",
                "category": "Technical Analysis",
                "difficulty_level": "intermediate",
                "order_index": 2,
                "tags": ["Technical Analysis", "Strategy"]
            },
            "TUTORIAL_STRATEGI_TRADING.md": {
                "title": "Tutorial Strategi Trading",
                "slug": "strategi-trading", 
                "description": "Panduan lengkap strategi trading yang terbukti menguntungkan",
                "category": "Trading Strategy",
                "difficulty_level": "intermediate",
                "order_index": 3,
                "tags": ["Strategy", "Advanced"]
            },
            "READY_FOR_REAL_TRADING.md": {
                "title": "Ready for Real Trading?",
                "slug": "ready-for-real-trading",
                "description": "Panduan transisi dari paper trading ke real money trading",
                "category": "Risk Management",
                "difficulty_level": "advanced",
                "order_index": 4,
                "tags": ["Risk Management", "Advanced"]
            },
            "RISK_MANAGEMENT_GUIDE.md": {
                "title": "Risk Management Guide",
                "slug": "risk-management-guide",
                "description": "Comprehensive internal risk management documentation",
                "category": "Risk Management", 
                "difficulty_level": "intermediate",
                "order_index": 5,
                "tags": ["Risk Management", "Strategy"]
            },
            "EXTERNAL_RISK_RESOURCES.md": {
                "title": "External Risk Management Resources",
                "slug": "external-risk-resources",
                "description": "Curated collection of professional risk management resources",
                "category": "Resources",
                "difficulty_level": "intermediate",
                "order_index": 6,
                "tags": ["Risk Management", "Advanced"]
            }
        }

    def parse_markdown_file(self, file_path: Path) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Parse markdown file and extract sections"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title (first H1)
        title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else file_path.stem
        
        # Extract description (content after title until first H2)
        desc_match = re.search(r'^# .+?\n\*(.+?)\*\n\n> (.+?)$', content, re.MULTILINE | re.DOTALL)
        description = desc_match.group(2) if desc_match else ""
        
        # Split content into sections by H2 headers
        sections = []
        section_pattern = r'^## (.+?)$'
        section_matches = list(re.finditer(section_pattern, content, re.MULTILINE))
        
        for i, match in enumerate(section_matches):
            section_title = match.group(1)
            section_start = match.end()
            
            # Find content until next section or end of file
            if i + 1 < len(section_matches):
                section_end = section_matches[i + 1].start()
                section_content = content[section_start:section_end].strip()
            else:
                section_content = content[section_start:].strip()
            
            # Create section slug
            section_slug = re.sub(r'[^\w\s-]', '', section_title.lower())
            section_slug = re.sub(r'[-\s]+', '-', section_slug)
            
            sections.append({
                'title': section_title,
                'slug': section_slug,
                'content': section_content,
                'order_index': i,
                'content_type': 'markdown'
            })
        
        # Calculate estimated read time (average 200 words per minute)
        word_count = len(content.split())
        estimated_read_time = max(1, round(word_count / 200))
        
        tutorial_data = {
            'title': title,
            'description': description,
            'estimated_read_time': estimated_read_time
        }
        
        return tutorial_data, sections

    def get_tag_ids(self, tag_names: List[str]) -> List[str]:
        """Get tag IDs from tag names"""
        response = self.supabase.table('tutorial_tags').select('id, name').execute()
        
        if response.data:
            tag_map = {tag['name']: tag['id'] for tag in response.data}
            return [tag_map[name] for name in tag_names if name in tag_map]
        return []

    def migrate_tutorial(self, filename: str, metadata: Dict[str, Any]) -> bool:
        """Migrate a single tutorial file to Supabase"""
        file_path = self.docs_dir / filename
        
        if not file_path.exists():
            print(f"❌ File not found: {file_path}")
            return False
        
        try:
            # Parse markdown file
            print(f"📄 Parsing {filename}...")
            tutorial_data, sections = self.parse_markdown_file(file_path)
            
            # Merge metadata with parsed data (exclude tags for separate handling)
            metadata_copy = metadata.copy()
            tags = metadata_copy.pop('tags', [])
            tutorial_data.update(metadata_copy)
            
            # Check if tutorial already exists
            existing = self.supabase.table('tutorials').select('id').eq('slug', metadata['slug']).execute()
            
            if existing.data:
                print(f"⚠️  Tutorial {metadata['slug']} already exists, updating...")
                tutorial_id = existing.data[0]['id']
                
                # Update tutorial
                self.supabase.table('tutorials').update(tutorial_data).eq('id', tutorial_id).execute()
                
                # Delete existing sections
                self.supabase.table('sections').delete().eq('tutorial_id', tutorial_id).execute()
            else:
                # Insert new tutorial
                print(f"➕ Creating new tutorial: {tutorial_data['title']}")
                result = self.supabase.table('tutorials').insert(tutorial_data).execute()
                tutorial_id = result.data[0]['id']
            
            # Insert sections
            for section in sections:
                section['tutorial_id'] = tutorial_id
            
            if sections:
                print(f"📝 Inserting {len(sections)} sections...")
                self.supabase.table('sections').insert(sections).execute()
            
            # Handle tags
            if tags:
                tag_ids = self.get_tag_ids(tags)
                if tag_ids:
                    # Delete existing tag relations
                    self.supabase.table('tutorial_tag_relations').delete().eq('tutorial_id', tutorial_id).execute()
                    
                    # Insert new tag relations
                    tag_relations = [{'tutorial_id': tutorial_id, 'tag_id': tag_id} for tag_id in tag_ids]
                    self.supabase.table('tutorial_tag_relations').insert(tag_relations).execute()
                    print(f"🏷️  Added {len(tag_ids)} tags")
            
            # Initialize analytics
            analytics_data = {
                'tutorial_id': tutorial_id,
                'view_count': 0,
                'unique_visitors': 0
            }
            
            # Check if analytics already exists
            existing_analytics = self.supabase.table('tutorial_analytics').select('id').eq('tutorial_id', tutorial_id).is_('section_id', 'null').execute()
            if not existing_analytics.data:
                self.supabase.table('tutorial_analytics').insert(analytics_data).execute()
            
            print(f"✅ Successfully migrated: {tutorial_data['title']}")
            return True
            
        except Exception as e:
            print(f"❌ Error migrating {filename}: {str(e)}")
            return False

    def migrate_all(self):
        """Migrate all tutorial files"""
        print("🚀 Starting tutorial migration to Supabase...")
        print(f"📁 Looking in: {self.docs_dir}")
        
        success_count = 0
        total_count = len(self.tutorial_files)
        
        for filename, metadata in self.tutorial_files.items():
            if self.migrate_tutorial(filename, metadata):
                success_count += 1
            print("-" * 50)
        
        print(f"\n📊 Migration Summary:")
        print(f"✅ Successful: {success_count}/{total_count}")
        print(f"❌ Failed: {total_count - success_count}/{total_count}")
        
        if success_count == total_count:
            print("🎉 All tutorials migrated successfully!")
        else:
            print("⚠️  Some tutorials failed to migrate")

def main():
    """Main function"""
    try:
        migrator = TutorialMigrator()
        migrator.migrate_all()
    except Exception as e:
        print(f"💥 Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()