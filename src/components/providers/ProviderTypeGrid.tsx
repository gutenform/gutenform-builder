"use client"

import { __ } from "@/lib/i18n"
import React, { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProviderTypeCard, type ProviderTypeCardItem } from "./ProviderTypeCard"
import { ChevronDown, ChevronUp } from "lucide-react"

const INITIAL_VISIBLE_COUNT = 5

export interface ProviderTypeGridProps {
  providerTypes: ProviderTypeCardItem[]
  comingSoon: ProviderTypeCardItem[]
  iconBaseUrl?: string
  onSelectType: (slug: string) => void
}

export function ProviderTypeGrid({
  providerTypes,
  comingSoon,
  iconBaseUrl = "",
  onSelectType,
}: ProviderTypeGridProps) {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState(false)

  const filteredAvailable = useMemo(() => {
    if (!search.trim()) return providerTypes
    const q = search.toLowerCase().trim()
    return providerTypes.filter((p) => p.title.toLowerCase().includes(q))
  }, [providerTypes, search])

  const filteredComingSoon = useMemo(() => {
    if (!search.trim()) return comingSoon
    const q = search.toLowerCase().trim()
    return comingSoon.filter((p) => p.title.toLowerCase().includes(q))
  }, [comingSoon, search])

  const allFiltered = useMemo(
    () => [
      ...filteredAvailable.map((p) => ({ ...p, comingSoon: false })),
      ...filteredComingSoon.map((p) => ({ ...p, comingSoon: true })),
    ],
    [filteredAvailable, filteredComingSoon]
  )

  const visibleItems = expanded ? allFiltered : allFiltered.slice(0, INITIAL_VISIBLE_COUNT)
  const hasMore = allFiltered.length > INITIAL_VISIBLE_COUNT

  const handleLess = () => {
    setExpanded(false)
    setSearch("")
  }

  return (
    <div className="space-y-4">
      {expanded && (
        <Input
          placeholder={__("searchProvider")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleItems.map((item) => {
          const { comingSoon: isComingSoon, ...provider } = item
          return isComingSoon ? (
            <ProviderTypeCard
              key={`coming-${provider.slug}`}
              provider={provider}
              comingSoon
              iconBaseUrl={iconBaseUrl}
            />
          ) : (
            <ProviderTypeCard
              key={provider.slug}
              provider={provider}
              iconBaseUrl={iconBaseUrl}
              onClick={() => onSelectType(provider.slug)}
            />
          )
        })}
      </div>
      {!expanded && hasMore && (
        <Button
          variant="outline"
          onClick={() => setExpanded(true)}
          className="w-full sm:w-auto"
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          {__("moreProviders")}
        </Button>
      )}
      {expanded && (
        <Button
          variant="outline"
          onClick={handleLess}
          className="w-full sm:w-auto"
        >
          <ChevronUp className="h-4 w-4 mr-2" />
          {__("less")}
        </Button>
      )}
    </div>
  )
}
