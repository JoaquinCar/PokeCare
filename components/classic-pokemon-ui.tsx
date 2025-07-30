"use client"

import type React from "react"
import { pokemonTheme } from "@/lib/pokemon-theme"

interface ClassicButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "accent" | "success" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

export function ClassicButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: ClassicButtonProps) {
  const variantStyles = {
    primary:
      "bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 border-blue-800 text-white",
    secondary: "bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 border-red-800 text-white",
    accent:
      "bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 border-yellow-800 text-gray-800",
    success:
      "bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-green-800 text-white",
    danger: "bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-red-900 text-white",
  }

  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${pokemonTheme.typography.button}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        border-2 rounded-lg shadow-xl
        ${pokemonTheme.animations.hover}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface ClassicCardProps {
  children: React.ReactNode
  title?: string
  variant?: "primary" | "secondary" | "accent" | "success"
  className?: string
}

export function ClassicCard({ children, title, variant = "primary", className = "" }: ClassicCardProps) {
  const variantStyles = {
    primary: {
      header: "bg-gradient-to-r from-blue-600 to-blue-700 border-blue-800",
      body: "border-blue-800",
    },
    secondary: {
      header: "bg-gradient-to-r from-red-600 to-red-700 border-red-800",
      body: "border-red-800",
    },
    accent: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-800",
      body: "border-yellow-800",
    },
    success: {
      header: "bg-gradient-to-r from-green-600 to-green-700 border-green-800",
      body: "border-green-800",
    },
  }

  return (
    <div className={`${className}`}>
      {title && (
        <div className={`${variantStyles[variant].header} text-white px-4 py-2 rounded-t-lg border-2`}>
          <h3 className={`${pokemonTheme.typography.heading} text-center`}>{title}</h3>
        </div>
      )}
      <div
        className={`bg-white ${variantStyles[variant].body} ${
          title ? "border-t-0 rounded-b-lg" : "rounded-lg"
        } border-2 p-4 shadow-lg`}
      >
        {children}
      </div>
    </div>
  )
}

interface ClassicHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  variant?: "primary" | "secondary" | "accent" | "success"
}

export function ClassicHeader({ title, subtitle, actions, variant = "primary" }: ClassicHeaderProps) {
  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-800 border-blue-900",
    secondary: "bg-gradient-to-r from-red-600 to-red-800 border-red-900",
    accent: "bg-gradient-to-r from-yellow-600 to-yellow-800 border-yellow-900",
    success: "bg-gradient-to-r from-green-600 to-green-800 border-green-900",
  }

  return (
    <header className={`${variantStyles[variant]} border-b-4 shadow-lg sticky top-0 z-40`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${pokemonTheme.typography.heading} text-2xl text-white`}>{title}</h1>
            {subtitle && <p className="text-white/90 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </div>
    </header>
  )
}

interface ClassicLoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function ClassicLoading({ text = "Loading...", size = "md" }: ClassicLoadingProps) {
  const sizeStyles = {
    sm: { spinner: "w-8 h-8", text: "text-sm" },
    md: { spinner: "w-12 h-12", text: "text-base" },
    lg: { spinner: "w-16 h-16", text: "text-lg" },
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-4">
        <div
          className={`${sizeStyles[size].spinner} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className={`${pokemonTheme.typography.heading} ${sizeStyles[size].text} text-blue-800`}>{text}</p>
    </div>
  )
}
