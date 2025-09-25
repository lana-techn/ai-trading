"""
Tutorial API routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.services.tutorial_service import tutorial_service

router = APIRouter(prefix="/api/v1/tutorials", tags=["tutorials"])

@router.get("/", response_model=List[Dict[str, Any]])
async def get_tutorials(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: Optional[int] = Query(None, description="Limit number of results")
):
    """Get all published tutorials"""
    try:
        tutorials = await tutorial_service.get_all_tutorials(category=category)
        
        if limit:
            tutorials = tutorials[:limit]
            
        return tutorials
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tutorials: {str(e)}")

@router.get("/categories", response_model=List[Dict[str, Any]])
async def get_tutorial_categories():
    """Get all tutorial categories with counts"""
    try:
        return await tutorial_service.get_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/tags", response_model=List[Dict[str, Any]])
async def get_tutorial_tags():
    """Get all available tutorial tags"""
    try:
        return await tutorial_service.get_tutorial_tags()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tags: {str(e)}")

@router.get("/search", response_model=List[Dict[str, Any]])
async def search_tutorials(
    q: str = Query(..., description="Search query", min_length=2)
):
    """Search tutorials by title, description, or content"""
    try:
        return await tutorial_service.search_tutorials(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching tutorials: {str(e)}")

@router.get("/{slug}", response_model=Dict[str, Any])
async def get_tutorial_by_slug(slug: str):
    """Get tutorial with all sections by slug"""
    try:
        tutorial = await tutorial_service.get_tutorial_by_slug(slug)
        
        if not tutorial:
            raise HTTPException(status_code=404, detail="Tutorial not found")
            
        return tutorial
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tutorial: {str(e)}")

@router.get("/{slug}/analytics", response_model=Dict[str, Any])
async def get_tutorial_analytics(slug: str):
    """Get analytics data for a tutorial"""
    try:
        tutorial = await tutorial_service.get_tutorial_by_slug(slug)
        
        if not tutorial:
            raise HTTPException(status_code=404, detail="Tutorial not found")
        
        analytics = await tutorial_service.get_tutorial_analytics(tutorial['id'])
        
        if not analytics:
            return {
                "tutorial_id": tutorial['id'],
                "view_count": 0,
                "unique_visitors": 0
            }
            
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@router.get("/{slug}/related", response_model=List[Dict[str, Any]])
async def get_related_tutorials(
    slug: str,
    limit: int = Query(3, description="Number of related tutorials to return")
):
    """Get related tutorials based on category and tags"""
    try:
        tutorial = await tutorial_service.get_tutorial_by_slug(slug)
        
        if not tutorial:
            raise HTTPException(status_code=404, detail="Tutorial not found")
        
        return await tutorial_service.get_related_tutorials(tutorial['id'], limit=limit)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching related tutorials: {str(e)}")

@router.get("/{tutorial_slug}/sections/{section_slug}", response_model=Dict[str, Any])
async def get_tutorial_section(tutorial_slug: str, section_slug: str):
    """Get specific section of a tutorial"""
    try:
        section = await tutorial_service.get_tutorial_section(tutorial_slug, section_slug)
        
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
            
        return section
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching section: {str(e)}")