
import { posts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export async function generateStaticParams() {
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts.find(p => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const url = `/blog/${post.slug}`;

  return {
    title: `${post.title} - Code Yapp Blog`,
    description: post.description,
    alternates: {
        canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      url: url,
      images: [
          {
              url: post.imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
          }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.imageUrl],
    },
  };
}


export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-invert prose-lg max-w-none">
            <header className="mb-8">
                 <h1 className="text-4xl md:text-5xl font-bold text-primary !mb-4">{post.title}</h1>
                 <p className="text-muted-foreground">
                    Published on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </header>
            
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
                <Image 
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    data-ai-hint={post.imageHint}
                />
            </div>

          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div className="mt-12 pt-8 border-t border-border">
          <Button asChild variant="outline">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
