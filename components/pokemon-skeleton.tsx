"use client"

import { Card, CardContent } from "@/components/ui/card"

export function PokemonSkeleton() {
  return (
    <Card className="overflow-hidden bg-white shadow-lg border-2 border-gray-200">
      <CardContent className="p-4">
        {/* Image Skeleton */}
        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse mb-4"></div>

        {/* Name Skeleton */}
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>

        {/* Types Skeleton */}
        <div className="flex gap-1 justify-center mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Button Skeleton */}
        <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
      </CardContent>
    </Card>
  )
}
