"""
Supabase configuration and client setup
"""
import os
from supabase import create_client, Client
from typing import Optional

class SupabaseConfig:
    """Supabase configuration class"""
    
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_ANON_KEY')
        self.service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self._client: Optional[Client] = None
        self._admin_client: Optional[Client] = None
    
    @property
    def client(self) -> Client:
        """Get Supabase client with anon key"""
        if self._client is None:
            if not self.url or not self.key:
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
            self._client = create_client(self.url, self.key)
        return self._client
    
    @property 
    def admin_client(self) -> Client:
        """Get Supabase client with service role key for admin operations"""
        if self._admin_client is None:
            if not self.url or not self.service_role_key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
            self._admin_client = create_client(self.url, self.service_role_key)
        return self._admin_client

# Global instance
supabase_config = SupabaseConfig()

def get_supabase_client() -> Client:
    """Get the default Supabase client"""
    return supabase_config.client

def get_supabase_admin_client() -> Client:
    """Get the Supabase admin client"""
    return supabase_config.admin_client