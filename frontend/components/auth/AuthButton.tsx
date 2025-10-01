'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import AuthModal from './AuthModal';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export default function AuthButton() {
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-foreground hidden md:block">
            {user.email?.split('@')[0]}
          </span>
          <ChevronDownIcon className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            showDropdown && "rotate-180"
          )} />
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-20">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Authenticated user
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <UserIcon className="h-4 w-4" />
        <span className="hidden md:inline">Sign In</span>
      </Button>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}