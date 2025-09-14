
import { posts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const recentPosts = posts
    .filter(p => p.slug !== params.slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          
          <article className="prose prose-invert prose-lg max-w-none col-span-1 lg:col-span-3">
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
                      priority
                  />
              </div>

            <div
              className="space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <aside className="col-span-1 lg:border-l lg:pl-8 mt-12 lg:mt-0 border-border">
              <h2 className="text-2xl font-bold mb-6 text-primary">Recent Posts</h2>
              <div className="space-y-6">
                  {recentPosts.map((p) => (
                      <Link href={`/blog/${p.slug}`} key={p.slug} className="block group">
                          <Card className="bg-transparent border-border/50 hover:border-primary/30 transition-colors">
                              <CardHeader className="p-4">
                                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{p.title}</CardTitle>
                              </CardHeader>
                          </Card>
                      </Link>
                  ))}
              </div>
          </aside>

        </div>

        <div className="mt-16 pt-8 border-t border-border max-w-4xl">
          <Button asChild variant="outline">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Posts
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
