"use client";

import React, { useRef, useState } from "react";
import { X, MessageCircle, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type ChatPosition = "bottom-right" | "bottom-left";
export type ChatSize = "sm" | "md" | "lg" | "xl" | "full";

const chatConfig = {
  dimensions: {
    sm: "sm:max-w-sm sm:max-h-[500px]",
    md: "sm:max-w-md sm:max-h-[600px]",
    lg: "sm:max-w-lg sm:max-h-[700px]",
    xl: "sm:max-w-xl sm:max-h-[800px]",
    full: "sm:w-full sm:h-full",
  },
  positions: {
    "bottom-right": "bottom-5 right-5",
    "bottom-left": "bottom-5 left-5",
  },
  chatPositions: {
    "bottom-right": "sm:bottom-[calc(100%+10px)] sm:right-0",
    "bottom-left": "sm:bottom-[calc(100%+10px)] sm:left-0",
  },
  states: {
    open: "pointer-events-auto opacity-100 visible scale-100 translate-y-0",
    closed:
      "pointer-events-none opacity-0 invisible scale-100 sm:translate-y-5",
  },
};

interface ExpandableChatProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: ChatPosition;
  size?: ChatSize;
  icon?: React.ReactNode;
}

const ExpandableChat: React.FC<ExpandableChatProps> = ({
  className,
  position = "bottom-right",
  size = "md",
  icon,
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div
      className={cn(
        "fixed z-[10000]",
        position === "bottom-right" ? "bottom-4 right-4 sm:bottom-5 sm:right-5" : "bottom-4 left-4 sm:bottom-5 sm:left-5",
        className
      )}
      {...props}
    >
      <div
        ref={chatRef}
        className={cn(
          "flex flex-col bg-white border-2 border-gray-300 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out absolute",
          // Mobile: fullscreen with safe areas, Desktop: positioned above button
          "w-full h-full sm:w-[420px] sm:h-[650px] lg:w-[440px] lg:h-[700px]",
          "inset-0 sm:inset-auto",
          // Mobile safe areas
          "pt-4 pb-4 sm:pt-0 sm:pb-0",
          position === "bottom-right" ? "sm:bottom-20 sm:right-0" : "sm:bottom-20 sm:left-0",
          isOpen 
            ? "pointer-events-auto opacity-100 visible scale-100 translate-y-0" 
            : "pointer-events-none opacity-0 invisible scale-90 translate-y-8",
          // Enhanced shadows for black and white theme
          "shadow-2xl border-gray-300",
          className,
        )}
      >
        {children}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 sm:hidden bg-black text-white hover:bg-gray-800 rounded-full w-8 h-8 z-10"
          onClick={toggleChat}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ExpandableChatToggle
        icon={icon}
        isOpen={isOpen}
        toggleChat={toggleChat}
      />
    </div>
  );
};

ExpandableChat.displayName = "ExpandableChat";

const ExpandableChatHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex-shrink-0", className)}
    {...props}
  />
);

ExpandableChatHeader.displayName = "ExpandableChatHeader";

const ExpandableChatBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("flex-grow overflow-y-auto", className)} {...props} />;

ExpandableChatBody.displayName = "ExpandableChatBody";

const ExpandableChatFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("border-t p-4", className)} {...props} />;

ExpandableChatFooter.displayName = "ExpandableChatFooter";

interface ExpandableChatToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  isOpen: boolean;
  toggleChat: () => void;
}

const ExpandableChatToggle: React.FC<ExpandableChatToggleProps> = ({
  className,
  icon,
  isOpen,
  toggleChat,
  ...props
}) => (
  <Button
    variant="default"
    onClick={toggleChat}
    className={cn(
      "w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 pointer-events-auto group",
      "bg-black hover:bg-gray-800 active:scale-95 border-4 border-white",
      "text-white fixed z-[10001] bottom-4 right-4 sm:bottom-5 sm:right-5",
      // Enhanced shadows and hover effects
      "hover:shadow-2xl hover:shadow-black/30 active:shadow-lg",
      // Subtle pulse when closed
      !isOpen && "hover:scale-110",
      // Mobile touch improvements
      "touch-manipulation select-none",
      className,
    )}
    {...props}
  >
    <div className="relative flex items-center justify-center">
      {isOpen ? (
        <X className="h-7 w-7 sm:h-8 sm:w-8 text-white transform group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <div className="relative">
          <div className="transform group-hover:scale-110 transition-transform duration-200">
            {icon || <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-white" />}
          </div>
          {/* Simple notification badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-10 group-active:animate-ping" />
        </div>
      )}
    </div>
  </Button>
);

ExpandableChatToggle.displayName = "ExpandableChatToggle";

export {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
};