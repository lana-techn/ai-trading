"""
Tutorial service for managing tutorial content from Supabase
"""
from typing import List, Dict, Any, Optional
from app.core.supabase import get_supabase_client
import logging

logger = logging.getLogger(__name__)

class TutorialService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_all_tutorials(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all published tutorials with basic info"""
        try:
            query = self.supabase.table('tutorial_summary').select('*')
            
            if category:
                query = query.eq('category', category)
            
            response = query.execute()
            
            if response.data:
                return response.data
            return []
            
        except Exception as e:
            logger.error(f"Error fetching tutorials: {str(e)}")
            return []
    
    async def get_tutorial_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Get tutorial with all sections by slug"""
        try:
            response = self.supabase.table('tutorials').select("""
                *,
                sections (
                    id,
                    title,
                    slug,
                    content,
                    order_index,
                    content_type
                )
            """).eq('slug', slug).eq('status', 'published').single().execute()
            
            if response.data:
                # Sort sections by order_index
                if response.data.get('sections'):
                    response.data['sections'] = sorted(
                        response.data['sections'], 
                        key=lambda x: x['order_index']
                    )
                
                # Update view count
                await self._increment_view_count(response.data['id'])
                
                return response.data
            return None
            
        except Exception as e:
            logger.error(f"Error fetching tutorial {slug}: {str(e)}")
            return None
    
    async def get_tutorial_section(self, tutorial_slug: str, section_slug: str) -> Optional[Dict[str, Any]]:
        """Get specific section of a tutorial"""
        try:
            response = self.supabase.table('sections').select("""
                *,
                tutorials (
                    id,
                    title,
                    slug,
                    category
                )
            """).eq('slug', section_slug).eq('tutorials.slug', tutorial_slug).single().execute()
            
            if response.data:
                return response.data
            return None
            
        except Exception as e:
            logger.error(f"Error fetching section {section_slug}: {str(e)}")
            return None
    
    async def search_tutorials(self, query: str) -> List[Dict[str, Any]]:
        """Search tutorials by title, description, or content"""
        try:
            if len(query.strip()) < 2:
                return []
            
            # Search in tutorials and sections
            search_term = f"%{query.lower()}%"
            
            response = self.supabase.table('tutorials').select("""
                id,
                title,
                slug,
                description,
                category,
                difficulty_level,
                estimated_read_time
            """).or_(
                f"title.ilike.{search_term},"
                f"description.ilike.{search_term},"
                f"category.ilike.{search_term}"
            ).eq('status', 'published').execute()
            
            results = response.data if response.data else []
            
            # Also search in sections
            section_response = self.supabase.table('sections').select("""
                tutorial_id,
                title,
                tutorials (
                    id,
                    title,
                    slug,
                    description,
                    category,
                    difficulty_level,
                    estimated_read_time
                )
            """).ilike('content', search_term).execute()
            
            if section_response.data:
                for section in section_response.data:
                    tutorial = section['tutorials']
                    if tutorial and tutorial not in results:
                        # Add section context
                        tutorial['matched_section'] = section['title']
                        results.append(tutorial)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching tutorials: {str(e)}")
            return []
    
    async def get_categories(self) -> List[Dict[str, Any]]:
        """Get all tutorial categories with counts"""
        try:
            response = self.supabase.table('tutorials').select(
                'category'
            ).eq('status', 'published').execute()
            
            if response.data:
                categories = {}
                for item in response.data:
                    category = item['category']
                    categories[category] = categories.get(category, 0) + 1
                
                return [
                    {'name': cat, 'count': count} 
                    for cat, count in categories.items()
                ]
            return []
            
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return []
    
    async def get_tutorial_tags(self) -> List[Dict[str, Any]]:
        """Get all available tags"""
        try:
            response = self.supabase.table('tutorial_tags').select('*').execute()
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error fetching tags: {str(e)}")
            return []
    
    async def get_related_tutorials(self, tutorial_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get related tutorials based on category and tags"""
        try:
            # First get the current tutorial's category and tags
            current_tutorial = await self.supabase.table('tutorials').select("""
                category,
                tutorial_tag_relations (
                    tag_id
                )
            """).eq('id', tutorial_id).single().execute()
            
            if not current_tutorial.data:
                return []
            
            category = current_tutorial.data['category']
            
            # Get tutorials from same category (excluding current)
            response = self.supabase.table('tutorial_summary').select('*').eq(
                'category', category
            ).neq('id', tutorial_id).limit(limit).execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error fetching related tutorials: {str(e)}")
            return []
    
    async def _increment_view_count(self, tutorial_id: str):
        """Increment view count for analytics"""
        try:
            # Check if analytics record exists
            existing = self.supabase.table('tutorial_analytics').select(
                'id', 'view_count'
            ).eq('tutorial_id', tutorial_id).is_('section_id', 'null').execute()
            
            if existing.data:
                # Update existing record
                current_count = existing.data[0]['view_count']
                self.supabase.table('tutorial_analytics').update({
                    'view_count': current_count + 1,
                    'last_viewed_at': 'NOW()'
                }).eq('id', existing.data[0]['id']).execute()
            else:
                # Create new record
                self.supabase.table('tutorial_analytics').insert({
                    'tutorial_id': tutorial_id,
                    'view_count': 1,
                    'unique_visitors': 1
                }).execute()
                
        except Exception as e:
            logger.error(f"Error updating view count: {str(e)}")
    
    async def get_tutorial_analytics(self, tutorial_id: str) -> Optional[Dict[str, Any]]:
        """Get analytics data for a tutorial"""
        try:
            response = self.supabase.table('tutorial_analytics').select('*').eq(
                'tutorial_id', tutorial_id
            ).is_('section_id', 'null').single().execute()
            
            return response.data if response.data else None
            
        except Exception as e:
            logger.error(f"Error fetching analytics: {str(e)}")
            return None

# Global service instance
tutorial_service = TutorialService()