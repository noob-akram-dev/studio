
import Link from 'next/link';
import { posts, type BlogPost } from '@/lib/blog-data';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Code Yapp',
  description: 'Articles and insights on privacy, security, and development from the Code Yapp team.',
};


function PostCard({ post }: { post: BlogPost }) {
    return (
        <Card className="flex flex-col h-full bg-card/50 border-border/50 shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30">
            <CardHeader>
                <CardTitle className="text-2xl">{post.title}</CardTitle>
                <CardDescription>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
                <Button asChild variant="secondary" className="w-full">
                    <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
