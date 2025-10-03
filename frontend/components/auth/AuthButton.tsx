'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from '@/components/ui/Button';
import { UserIcon } from '@heroicons/react/24/outline';

export default function AuthButton() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="hidden md:inline">Sign In</span>
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm" className="hidden md:inline-flex">
            Create account
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}