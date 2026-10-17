import { getBlogPostById } from "@/lib/notion"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BlogArticleView } from "@/components/blog-article-view"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getBlogPostById(id)

  if (!post) {
    return {
      title: "Articolo non trovato | Bee Coop",
      description: "La storia richiesta non è al momento disponibile.",
    }
  }

  const postUrl = `https://beecoop-puntovendita.vercel.app/blog/${post.id}`
  const ogImage = post.coverImage.startsWith("http")
    ? post.coverImage
    : `https://beecoop-puntovendita.vercel.app${post.coverImage}`

  return {
    title: `${post.title} | Bee Coop`,
    description: post.excerpt,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: "Bee Coop - La Follia che si fa Realtà",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getBlogPostById(id)

  if (!post) {
    notFound()
  }

  return <BlogArticleView post={post} />
}
