import type { Profile } from './types'

export function calculateCompatibility(profile1: Profile, profile2: Profile): number {
  if (!profile1.lifestyle || !profile2.lifestyle) return 0
  
  const tags1 = new Set(profile1.lifestyle)
  const tags2 = new Set(profile2.lifestyle)
  
  let matches = 0
  tags1.forEach(tag => {
    if (tags2.has(tag)) {
      matches++
    }
  })
  
  const totalTags = new Set([...profile1.lifestyle, ...profile2.lifestyle]).size
  if (totalTags === 0) return 0
  
  // Return percentage
  return Math.round((matches / totalTags) * 100)
}

export function getCompatibilityColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 50) return 'text-amber-600 bg-amber-50'
  return 'text-muted-foreground bg-muted'
}
