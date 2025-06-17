import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { searchContent, getPopularTags, getContentCategories, type SearchResult, type SearchFilters } from "@/api/search-api";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatures } from "@/lib/features";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResultCard from "@/components/SearchResultCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search as SearchIcon, Filter, X, BookOpen, Video, FileText, Users, Tag, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import withErrorBoundary from '@/components/withErrorBoundary';

export default withErrorBoundary(function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasAccess } = useFeatures();
  
  // Get initial query from URL
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";
  
  // State for search
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState(initialType);
  
  // State for filters
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    tier: [],
    category: [],
    tags: []
  });
  
  // State for pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // State for categories and tags
  const [categories, setCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  
  // Debounce search query to avoid too many requests
  const debouncedQuery = useDebounce(query, 500);
  
  // Load categories and popular tags on mount
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [tagsData, categoriesData] = await Promise.all([
          getPopularTags(15),
          getContentCategories()
        ]);
        
        setPopularTags(tagsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };
    
    loadFilterData();
  }, [getPopularTags, getContentCategories]);
  
  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (query) params.set("q", query);
    if (activeTab !== "all") params.set("type", activeTab);
    
    setSearchParams(params, { replace: true });
  }, [query, activeTab, setSearchParams]);
  
  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery && filters.type?.length === 0 && 
          filters.category?.length === 0 && filters.tags?.length === 0) {
        setResults([]);
        setTotal(0);
        return;
      }
      
      setLoading(true);
      
      try {
        // Convert activeTab to filter
        let typeFilter = filters.type;
        if (activeTab !== "all") {
          switch (activeTab) {
            case "lessons":
              typeFilter = ["lesson"];
              break;
            case "videos":
              typeFilter = ["video"];
              break;
            case "articles":
              typeFilter = ["article"];
              break;
            case "community":
              typeFilter = ["community"];
              break;
          }
        }
        
        const searchFilters = {
          ...filters,
          type: typeFilter
        };
        
        const offset = (page - 1) * limit;
        const { results: searchResults, total: totalResults } = await searchContent(
          debouncedQuery,
          searchFilters,
          limit,
          offset
        );
        
        setResults(searchResults);
        setTotal(totalResults);
      } catch (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to perform search. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [debouncedQuery, filters, activeTab, page]);
  
  // Handle filter changes
  const toggleFilter = (filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];
      const newValues = currentValues.includes(value as never)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterType]: newValues
      };
    });
    
    // Reset to page 1 when filters change
    setPage(1);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: [],
      tier: [],
      category: [],
      tags: []
    });
    setActiveTab("all");
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };
  
  // Extract search terms for highlighting
  const getSearchTerms = () => {
    if (!debouncedQuery) return [];
    return debouncedQuery.split(/\s+/).filter(term => term.length > 2);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Search PGV Academy</h1>
            <p className="text-muted-foreground">Find lessons, videos, articles, and community posts</p>
          </div>
          
          <div className="relative mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for lessons, videos, articles..."
                  className="pl-10 pr-4 h-12"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                className={`${showFilters ? 'bg-muted' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {(filters.type.length > 0 || filters.tier.length > 0 || filters.category.length > 0 || filters.tags.length > 0) && (
                  <Badge className="ml-2 bg-pgv-green h-5 w-5 p-0 flex items-center justify-center">
                    {filters.type.length + filters.tier.length + filters.category.length + filters.tags.length}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* Active filters */}
            {(filters.type.length > 0 || filters.tier.length > 0 || filters.category.length > 0 || filters.tags.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                
                {filters.type.map(type => (
                  <Badge key={`type-${type}`} variant="secondary" className="flex items-center gap-1">
                    {type}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleFilter('type', type)}
                    />
                  </Badge>
                ))}
                
                {filters.tier.map(tier => (
                  <Badge key={`tier-${tier}`} variant="secondary" className="flex items-center gap-1">
                    {tier} tier
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleFilter('tier', tier)}
                    />
                  </Badge>
                ))}
                
                {filters.category.map(category => (
                  <Badge key={`category-${category}`} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleFilter('category', category)}
                    />
                  </Badge>
                ))}
                
                {filters.tags.map(tag => (
                  <Badge key={`tag-${tag}`} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleFilter('tags', tag)}
                    />
                  </Badge>
                ))}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
          
          {/* Filter panel */}
          {showFilters && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Content Type Filters */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-pgv-green" />
                      Content Type
                    </h3>
                    <div className="space-y-2">
                      {['lesson', 'video', 'article', 'community'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`type-${type}`} 
                            checked={filters.type.includes(type)}
                            onCheckedChange={() => toggleFilter('type', type)}
                          />
                          <label 
                            htmlFor={`type-${type}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                          >
                            {type === 'lesson' ? 'Lessons' : 
                             type === 'video' ? 'Videos' : 
                             type === 'article' ? 'Articles' : 'Community Posts'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Membership Tier Filters */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-pgv-green" />
                      Membership Tier
                    </h3>
                    <div className="space-y-2">
                      {['free', 'driven', 'aspiring', 'breakthrough'].map(tier => (
                        <div key={tier} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`tier-${tier}`} 
                            checked={filters.tier.includes(tier)}
                            onCheckedChange={() => toggleFilter('tier', tier)}
                          />
                          <label 
                            htmlFor={`tier-${tier}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                          >
                            {tier}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Category Filters */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-pgv-green" />
                      Categories
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {categories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`} 
                            checked={filters.category.includes(category)}
                            onCheckedChange={() => toggleFilter('category', category)}
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {/* Popular Tags */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-pgv-green" />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${filters.tags.includes(tag) ? 'bg-pgv-green hover:bg-pgv-green/90' : 'hover:bg-muted'}`}
                        onClick={() => toggleFilter('tags', tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Search Results */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Found {total} results {debouncedQuery ? `for "${debouncedQuery}"` : ''}
                </div>
                
                <div className="space-y-4">
                  {results.map(result => (
                    <SearchResultCard
                      key={`${result.type}-${result.id}`}
                      id={result.id}
                      title={result.title}
                      type={result.type}
                      description={result.description}
                      thumbnailUrl={result.thumbnail_url}
                      url={result.url}
                      createdAt={result.created_at}
                      author={result.author}
                      tier={result.tier}
                      tags={result.tags}
                      category={result.category}
                      highlightTerms={getSearchTerms()}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {total > limit && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">
                        Page {page} of {Math.ceil(total / limit)}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(total / limit)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : debouncedQuery || Object.values(filters).some(f => f.length > 0) ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <SearchIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any content matching your search criteria. Try adjusting your filters or search terms.
                </p>
                {(debouncedQuery || Object.values(filters).some(f => f.length > 0)) && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setQuery('');
                      clearFilters();
                    }}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <SearchIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">Search for content</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter a search term above to find lessons, videos, articles, and community posts.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}, 'search');
