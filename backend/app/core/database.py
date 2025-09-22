"""
Database configuration and session management for AI Trading Agent.
Supports both PostgreSQL for production and SQLite for development.
"""

import os
import asyncio
from typing import AsyncGenerator
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import redis.asyncio as redis
from contextlib import asynccontextmanager

from app.core.config import settings, get_database_url
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Create declarative base
Base = declarative_base()

# Database engines
engine = None
async_engine = None
SessionLocal = None
AsyncSessionLocal = None

# Redis connection
redis_client = None

def get_database_connection_info():
    """Get database connection information for logging."""
    db_url = get_database_url()
    if db_url.startswith('postgresql'):
        db_type = 'PostgreSQL'
    elif db_url.startswith('sqlite'):
        db_type = 'SQLite'
    else:
        db_type = 'Unknown'
    
    return {
        'type': db_type,
        'url': db_url.split('@')[-1] if '@' in db_url else db_url,  # Hide credentials
        'async_enabled': True
    }

def init_database():
    """Initialize database connections (sync)."""
    global engine, SessionLocal
    
    try:
        database_url = get_database_url()
        
        # For SQLite, we need to handle the connection differently
        if database_url.startswith('sqlite'):
            engine = create_engine(
                database_url, 
                connect_args={"check_same_thread": False},
                echo=settings.DEBUG
            )
        else:
            # PostgreSQL connection
            engine = create_engine(database_url, echo=settings.DEBUG)
        
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create tables
        from app.models.models import Base
        Base.metadata.create_all(bind=engine)
        
        db_info = get_database_connection_info()
        logger.info(f"Database initialized: {db_info['type']} at {db_info['url']}")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

async def init_async_database():
    """Initialize async database connections."""
    global async_engine, AsyncSessionLocal
    
    try:
        database_url = get_database_url()
        
        # Convert sync URL to async URL
        if database_url.startswith('postgresql'):
            async_url = database_url.replace('postgresql://', 'postgresql+asyncpg://')
        elif database_url.startswith('sqlite'):
            async_url = database_url.replace('sqlite:///', 'sqlite+aiosqlite:///')
        else:
            raise ValueError(f"Unsupported database URL: {database_url}")
        
        async_engine = create_async_engine(async_url, echo=settings.DEBUG)
        AsyncSessionLocal = async_sessionmaker(
            async_engine, class_=AsyncSession, expire_on_commit=False
        )
        
        # Create tables asynchronously
        async with async_engine.begin() as conn:
            from app.models.models import Base
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Async database initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize async database: {e}")
        raise

async def init_redis():
    """Initialize Redis connection for caching."""
    global redis_client
    
    try:
        if settings.REDIS_URL:
            redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            
            # Test connection
            await redis_client.ping()
            logger.info("Redis connection established")
        else:
            logger.warning("Redis URL not configured, caching disabled")
            
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}")
        redis_client = None

def get_db() -> Session:
    """Dependency for sync database sessions."""
    if not SessionLocal:
        init_database()
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for async database sessions."""
    if not AsyncSessionLocal:
        await init_async_database()
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()

async def get_redis() -> redis.Redis:
    """Dependency for Redis client."""
    if not redis_client:
        await init_redis()
    return redis_client

@asynccontextmanager
async def database_transaction(session: AsyncSession):
    """Context manager for database transactions."""
    try:
        yield session
        await session.commit()
    except Exception as e:
        await session.rollback()
        logger.error(f"Database transaction failed: {e}")
        raise e

# Database utilities
class DatabaseManager:
    """Database management utilities."""
    
    @staticmethod
    async def health_check() -> dict:
        """Check database health."""
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute("SELECT 1")
                result.fetchone()
                
            db_info = get_database_connection_info()
            return {
                "status": "healthy",
                "database_type": db_info["type"],
                "connection": "active"
            }
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    @staticmethod
    async def redis_health_check() -> dict:
        """Check Redis health."""
        try:
            if redis_client:
                await redis_client.ping()
                return {
                    "status": "healthy",
                    "connection": "active"
                }
            else:
                return {
                    "status": "disabled",
                    "connection": "none"
                }
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    @staticmethod
    async def get_stats() -> dict:
        """Get database statistics."""
        try:
            async with AsyncSessionLocal() as session:
                # Get table counts
                from app.models.models import User, Trade, AIDecision, MarketData
                
                user_count = await session.execute("SELECT COUNT(*) FROM users")
                trade_count = await session.execute("SELECT COUNT(*) FROM trades") 
                ai_decision_count = await session.execute("SELECT COUNT(*) FROM ai_decisions")
                market_data_count = await session.execute("SELECT COUNT(*) FROM market_data")
                
                return {
                    "users": user_count.scalar(),
                    "trades": trade_count.scalar(),
                    "ai_decisions": ai_decision_count.scalar(),
                    "market_data_points": market_data_count.scalar()
                }
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {}

# Cache utilities
class CacheManager:
    """Redis cache management utilities."""
    
    @staticmethod
    async def get(key: str):
        """Get value from cache."""
        try:
            if redis_client:
                return await redis_client.get(key)
        except Exception as e:
            logger.warning(f"Cache get failed for key {key}: {e}")
        return None
    
    @staticmethod
    async def set(key: str, value: str, ttl: int = None):
        """Set value in cache with optional TTL."""
        try:
            if redis_client:
                if ttl:
                    await redis_client.setex(key, ttl, value)
                else:
                    await redis_client.set(key, value)
        except Exception as e:
            logger.warning(f"Cache set failed for key {key}: {e}")
    
    @staticmethod
    async def delete(key: str):
        """Delete key from cache."""
        try:
            if redis_client:
                await redis_client.delete(key)
        except Exception as e:
            logger.warning(f"Cache delete failed for key {key}: {e}")
    
    @staticmethod
    async def exists(key: str) -> bool:
        """Check if key exists in cache."""
        try:
            if redis_client:
                return await redis_client.exists(key) > 0
        except Exception as e:
            logger.warning(f"Cache exists check failed for key {key}: {e}")
        return False

# Global instances
db_manager = DatabaseManager()
cache_manager = CacheManager()

# Startup/shutdown handlers
async def startup_database():
    """Initialize all database connections on startup."""
    logger.info("Initializing database connections...")
    
    # Initialize sync database
    init_database()
    
    # Initialize async database
    await init_async_database()
    
    # Initialize Redis
    await init_redis()
    
    logger.info("Database initialization completed")

async def shutdown_database():
    """Close all database connections on shutdown."""
    logger.info("Closing database connections...")
    
    try:
        if async_engine:
            await async_engine.dispose()
        
        if engine:
            engine.dispose()
        
        if redis_client:
            await redis_client.close()
            
        logger.info("Database connections closed")
        
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")