import type { Metadata, ResolvingMetadata } from 'next'
import { insforge } from '@/lib/insforge'
import ListingDetailPage from './listing-detail'

type Props = {
  params: Promise<{ city: string; id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params

  const { data: listing } = await insforge.database
    .from('listings')
    .select('*, cities(*)')
    .eq('id', id)
    .single()

  if (!listing) {
    return {
      title: 'Listing Not Found | Homeys World',
    }
  }

  const previousImages = (await parent).openGraph?.images || []
  const imageUrl = listing.photo_urls?.[0]

  return {
    title: `${listing.title} | Homeys World`,
    description: listing.description?.substring(0, 160) || `Check out this listing in ${listing.cities?.name}`,
    openGraph: {
      title: listing.title,
      description: listing.description?.substring(0, 160),
      images: imageUrl ? [imageUrl, ...previousImages] : previousImages,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: listing.description?.substring(0, 160),
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function Page(props: Props) {
  return <ListingDetailPage />
}
