import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Clock, Eye, TrendingUp, Filter, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from '@/utils';

// Sample posts data
const samplePosts = [
  {
    id: 'sample-1',
    title: 'The Evolution of Psychographic Analytics: From Market Research to Real-Time AI',
    slug: 'evolution-psychographic-analytics-ai-2025',
    excerpt: 'Psychographic analytics has transformed from manual survey-based research into sophisticated AI-powered systems that decode user psychology in real-time. This article explores the technological breakthroughs enabling modern psychographic intelligence platforms.',
    author: 'Travis Capps',
    author_bio: 'Travis Capps is a Principal Systems Architect, Technology Advisor, and founder of knXw. With 20+ years in digital design, AI, and systems strategy, he helps organizations architect intelligent solutions that scale. Learn more at traviscapps.info.',
    author_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
    category: 'product-psychology',
    tags: ['psychographics', 'AI', 'behavioral-analytics', 'machine-learning', 'real-time-analytics'],
    reading_time: 12,
    published: true,
    published_date: '2025-10-15T09:00:00Z',
    featured: true,
    view_count: 2847
  },
  {
    id: 'sample-2',
    title: 'Building Privacy-First Analytics in the Age of AI: A Technical Framework',
    slug: 'privacy-first-analytics-ai-framework-2025',
    excerpt: 'As AI-powered analytics become more sophisticated, the privacy challenge intensifies. This comprehensive guide outlines architectural patterns and technical implementations for building privacy-preserving psychographic systems.',
    author: 'Travis Capps',
    author_bio: 'Travis Capps is a Principal Systems Architect, Technology Advisor, and founder of knXw. With 20+ years in digital design, AI, and systems strategy, he helps organizations architect intelligent solutions that scale. Learn more at traviscapps.info.',
    author_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    featured_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=600&fit=crop',
    category: 'guide',
    tags: ['privacy', 'security', 'GDPR', 'data-protection', 'ethical-AI', 'architecture'],
    reading_time: 15,
    published: true,
    published_date: '2025-10-22T14:00:00Z',
    featured: true,
    view_count: 1923
  },
  {
    id: 'sample-3',
    title: 'How Fortune 500 Companies Use Psychographic Intelligence for Conversion Optimization',
    slug: 'fortune-500-psychographic-conversion-optimization-2025',
    excerpt: 'Leading enterprises are leveraging psychographic intelligence to achieve conversion rate improvements of 40-300%. This case study analysis reveals the strategies, implementation patterns, and measurable outcomes.',
    author: 'Travis Capps',
    author_bio: 'Travis Capps is a Principal Systems Architect, Technology Advisor, and founder of knXw. With 20+ years in digital design, AI, and systems strategy, he helps organizations architect intelligent solutions that scale. Learn more at traviscapps.info.',
    author_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    category: 'case-study',
    tags: ['conversion-optimization', 'enterprise', 'case-study', 'ROI', 'personalization'],
    reading_time: 18,
    published: true,
    published_date: '2025-11-05T10:00:00Z',
    featured: true,
    view_count: 3156
  }
];

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setPosts(samplePosts);
        setFeaturedPosts(samplePosts.filter(post => post.featured));
      } catch (err) {
        setError("Failed to load posts.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts]);

  const getCategoryColor = (category) => {
    const colors = {
      'case-study': 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30',
      'guide': 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30',
      'startup-growth': 'bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30',
      'product-psychology': 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30',
      'analytics': 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30',
      'conversion-optimization': 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30',
      'user-research': 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30',
      'ai-insights': 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
    };
    return colors[category] || 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
  };

  const formatCategoryName = (category) => {
    if (!category) return 'General';
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const categories = [
    'case-study',
    'guide', 
    'startup-growth',
    'product-psychology',
    'analytics',
    'conversion-optimization',
    'user-research',
    'ai-insights'
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-b from-[#111111] to-[#0a0a0a] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Link to={createPageUrl('Landing')} className="inline-flex items-center gap-2 text-[#00d4ff] hover:text-[#0ea5e9] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to knXw
          </Link>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#ec4899] to-[#fbbf24] bg-clip-text text-transparent">
                Intelligence
              </span>{" "}
              <span className="text-white">Insights</span>
            </h1>
            <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto">
              Deep dives into psychographic intelligence, behavioral analytics, AI systems architecture, and the future of user understanding.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-[#00d4ff]" />
              <h2 className="text-2xl font-bold text-white">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link key={post.id} to={createPageUrl(`BlogPost?slug=${post.slug}`)} className="group">
                  <Card className="bg-[#111111] border-[#262626] overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300 h-full">
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getCategoryColor(post.category)}>
                          {formatCategoryName(post.category)}
                        </Badge>
                        <Badge variant="outline" className="border-[#fbbf24]/30 text-[#fbbf24]">
                          Featured
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[#a3a3a3] mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-[#6b7280]">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(post.published_date), 'MMM d, yyyy')}
                          </span>
                          {post.reading_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.reading_time} min
                            </span>
                          )}
                        </div>
                        {post.view_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.view_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111111] border-[#262626] text-white placeholder-[#a3a3a3]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#a3a3a3]" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-[#111111] border-[#262626] text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#262626]">
                <SelectItem value="all" className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                    {formatCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8">All Articles</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-[#111111] border-[#262626]">
                  <div className="aspect-video bg-[#1a1a1a] animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-4 w-1/3 bg-[#1a1a1a] rounded animate-pulse mb-3"></div>
                    <div className="h-5 w-full bg-[#1a1a1a] rounded animate-pulse mb-2"></div>
                    <div className="h-5 w-2/3 bg-[#1a1a1a] rounded animate-pulse mb-4"></div>
                    <div className="h-10 w-full bg-[#1a1a1a] rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={createPageUrl(`BlogPost?slug=${post.slug}`)} className="group">
                  <Card className="bg-[#111111] border-[#262626] overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300 h-full">
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <Badge className={getCategoryColor(post.category)} size="sm">
                        {formatCategoryName(post.category)}
                      </Badge>
                      <h3 className="text-lg font-bold text-white mt-3 mb-2 group-hover:text-[#00d4ff] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#a3a3a3] line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#6b7280]">
                        <div className="flex items-center gap-3">
                          <span>{format(new Date(post.published_date), 'MMM d, yyyy')}</span>
                          {post.reading_time && <span>{post.reading_time} min</span>}
                        </div>
                        {post.view_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.view_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#a3a3a3]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No articles found</h3>
              <p className="text-[#a3a3a3] mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                variant="outline"
                className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626] hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}