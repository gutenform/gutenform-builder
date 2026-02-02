"use client"

import { __ } from "@/lib/i18n"
import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Database, Mail, LucideIcon } from "lucide-react"

const SLUG_TO_ICON: Record<string, LucideIcon> = {
  database: Database,
  email: Mail,
}

export interface ProviderTypeCardItem {
  slug: string
  title: string
  icon?: string | null
}

interface ProviderTypeCardProps {
  provider: ProviderTypeCardItem
  comingSoon?: boolean
  iconBaseUrl?: string
  onClick?: () => void
}

export function ProviderTypeCard({
  provider,
  comingSoon = false,
  iconBaseUrl = "",
  onClick,
}: ProviderTypeCardProps) {
  const [iconError, setIconError] = useState(false)
  const FallbackIcon = SLUG_TO_ICON[provider.slug] ?? Database
  const iconUrl = provider.icon ?? (iconBaseUrl ? `${iconBaseUrl}${provider.slug}.svg` : null)
  const showImg = iconUrl && !iconError

  return (
    <Card
      className={cn(
        "aspect-square flex flex-col cursor-pointer transition-colors hover:bg-accent/50",
        comingSoon && "opacity-60 cursor-not-allowed hover:bg-transparent"
      )}
      onClick={comingSoon ? undefined : onClick}
    >
      <CardContent className="flex flex-1 flex-col items-center justify-center p-4 relative">
        {comingSoon && (
          <span className="absolute top-2 right-2 text-xs bg-muted px-2 py-0.5 rounded">
            {__("comingSoon")}
          </span>
        )}
        <div className="flex-1 flex items-center justify-center w-full">
          {showImg ? (
            <img
              src={iconUrl!}
              alt=""
              className="h-12 w-12 object-contain"
              onError={() => setIconError(true)}
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">
              <FallbackIcon className="h-12 w-12" />
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-center mt-2 line-clamp-2">
          {provider.title}
        </p>
      </CardContent>
    </Card>
  )
}
