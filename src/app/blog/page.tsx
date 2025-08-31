
import Link from 'next/link';
import { posts, type BlogPost } from '@/lib/blog-data';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Blog - Code Yapp',
  description: 'Articles and insights on privacy, security, and development from the Code Yapp team.',
};


function PostCard({ post }: { post: BlogPost }) {
    return (
        <Link href={`/blog/${post.slug}`} className="block group">
            <Card className="flex flex-col h-full bg-card/50 border-border/50 shadow-md transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:border-primary/30 overflow-hidden">
                <CardHeader className="p-0">
                    <div className="block relative aspect-video">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                            data-ai-hint={post.imageHint}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col">
                    <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                    <CardDescription className="flex-1">{post.description}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-4">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                    <Button asChild variant="secondary" className="w-full" tabIndex={-1}>
                        {/* The Link is on the parent, this is for styling */}
                        <div>
                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}

export default function BlogIndexPage() {
  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">Code Yapp Blog</h1>
          <p className="text-xl text-muted-foreground">
            Insights on privacy, security, and developer collaboration.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedPosts.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </main>
         <div className="mt-16 text-center">
            <Button asChild>
                <Link href="/">Return to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
