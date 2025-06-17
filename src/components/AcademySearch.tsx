import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  tags: string[];
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "video" | "article" | "course";
  url: string;
}

interface AcademySearchProps {
  onResultsChange?: (results: SearchResult[]) => void;
  initialQuery?: string;
  showResults?: boolean;
  categories?: string[];
  placeholder?: string;
  className?: string;
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-800 hover:bg-green-200",
  intermediate: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  advanced: "bg-purple-100 text-purple-800 hover:bg-purple-200",
};

const TYPE_COLORS = {
  video: "bg-red-100 text-red-800 hover:bg-red-200",
  article: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  course: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
};

export default function AcademySearch({
  onResultsChange,
  initialQuery = "",
  showResults = true,
  categories = [],
  placeholder = "Search for tutorials, lessons, or topics...",
  className = "",
}: AcademySearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch available tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Check if table exists first
        const { error: tableCheckError } = await supabase
          .from('academy_content_tags')
          .select('name', { count: 'exact', head: true });

        // If table doesn't exist, use fallback tags
        if (tableCheckError) {
          console.log('Using fallback tags since academy_content_tags table is not available');
          setAvailableTags([
            'short game', 'putting', 'driving', 'iron play', 'mental game', 'course management',
            'fitness', 'equipment', 'rules', 'etiquette', 'tournament prep', 'beginners'
          ]);
          return;
        }

        // If table exists, fetch tags normally
        const { data, error } = await supabase
          .from("academy_content_tags")
          .select("name")
          .order("name");

        if (error) throw error;

        const tags = data.map((tag) => tag.name);
        setAvailableTags(tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        // Fallback to default tags in case of any error
        setAvailableTags([
          'short game', 'putting', 'driving', 'iron play', 'mental game', 'course management',
          'fitness', 'equipment', 'rules', 'etiquette', 'tournament prep', 'beginners'
        ]);
      }
    };

    fetchTags();
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      if (!query && selectedTags.length === 0 && !selectedDifficulty && !selectedType) {
        setResults([]);
        if (onResultsChange) onResultsChange([]);
        return;
      }

      setIsSearching(true);

      try {
        let queryBuilder = supabase
          .from("academy_content")
          .select("*");

        // Apply text search if query exists
        if (query) {
          queryBuilder = queryBuilder.or(
            `title.ilike.%${query}%,description.ilike.%${query}%`
          );
        }

        // Apply tag filters
        if (selectedTags.length > 0) {
          // This assumes tags are stored as an array in the database
          selectedTags.forEach(tag => {
            queryBuilder = queryBuilder.contains('tags', [tag]);
          });
        }

        // Apply difficulty filter
        if (selectedDifficulty) {
          queryBuilder = queryBuilder.eq('difficulty', selectedDifficulty);
        }

        // Apply content type filter
        if (selectedType) {
          queryBuilder = queryBuilder.eq('type', selectedType);
        }

        // Apply category filter if provided
        if (categories.length > 0) {
          queryBuilder = queryBuilder.in('category', categories);
        }

        // Execute the query
        const { data, error } = await queryBuilder.order('created_at', { ascending: false });

        if (error) throw error;

        setResults(data || []);
        if (onResultsChange) onResultsChange(data || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        if (onResultsChange) onResultsChange([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedTags, selectedDifficulty, selectedType, categories, onResultsChange]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulty(prev => prev === difficulty ? null : difficulty);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedType(prev => prev === type ? null : type);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedTags([]);
    setSelectedDifficulty(null);
    setSelectedType(null);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
  };

  const hasActiveFilters = query || selectedTags.length > 0 || selectedDifficulty || selectedType;

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
          
          {/* Difficulty filters */}
          <div className="flex flex-wrap gap-1">
            {["beginner", "intermediate", "advanced"].map((difficulty) => (
              <Badge
                key={difficulty}
                variant="outline"
                className={`cursor-pointer capitalize ${selectedDifficulty === difficulty ? DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] : ''}`}
                onClick={() => handleDifficultyToggle(difficulty)}
              >
                {difficulty}
              </Badge>
            ))}
          </div>
          
          {/* Content type filters */}
          <div className="flex flex-wrap gap-1 ml-2">
            {["video", "article", "course"].map((type) => (
              <Badge
                key={type}
                variant="outline"
                className={`cursor-pointer capitalize ${selectedType === type ? TYPE_COLORS[type as keyof typeof TYPE_COLORS] : ''}`}
                onClick={() => handleTypeToggle(type)}
              >
                {type}
              </Badge>
            ))}
          </div>

          {/* Popular tags */}
          <div className="flex flex-wrap gap-1 ml-2">
            {availableTags.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`cursor-pointer ${selectedTags.includes(tag) ? 'bg-pgv-green text-white hover:bg-pgv-green/90' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs h-7 px-2"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {showResults && (
        <div className="mt-6">
          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={result.thumbnail_url}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${TYPE_COLORS[result.type]}`}
                    >
                      {result.type}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1">{result.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {result.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge
                        className={DIFFICULTY_COLORS[result.difficulty]}
                        variant="secondary"
                      >
                        {result.difficulty}
                      </Badge>
                      {result.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {result.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.tags.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasActiveFilters ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found. Try different search terms or filters.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
