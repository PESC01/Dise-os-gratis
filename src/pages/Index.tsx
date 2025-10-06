import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDesigns } from "@/hooks/useDesigns";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  const { data: designs, isLoading: designsLoading } = useDesigns();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { isAuthenticated } = useAuth();

  // Obtener subcategorías de la categoría seleccionada
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === "all" || !categories) return [];
    
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  // Resetear subcategoría cuando cambia la categoría
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory("all");
  };

  // Filtrar y buscar diseños
  const filteredDesigns = useMemo(() => {
    if (!designs) return [];

    return designs.filter((design) => {
      // Filtro por búsqueda
      const matchesSearch = design.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        design.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro por categoría
      const matchesCategory =
        selectedCategory === "all" || design.category_id === selectedCategory;

      // Filtro por subcategoría
      const matchesSubcategory =
        selectedSubcategory === "all" || design.subcategory_id === selectedSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [designs, searchQuery, selectedCategory, selectedSubcategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b">
        <div className="absolute inset-0 gradient-primary opacity-10"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
              Diseños DTF & Sublimación
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra colección de diseños profesionales para prendas, tazas y más
            </p>
          </div>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar diseños..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {availableSubcategories.length > 0 && (
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Designs Gallery */}
      <main className="container mx-auto px-4 py-8">
        {designsLoading || categoriesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredDesigns.map((design, index) => (
              <Link
                key={design.id}
                to={`/design/${design.id}`}
                className="group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-smooth transform hover:-translate-y-1 animate-fade-in">
                  <div className="aspect-square relative overflow-hidden">
                    {(design as any).cover_image_url ? (
                      <img
                        src={(design as any).cover_image_url}
                        alt={design.title}
                        className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : design.images && design.images.length > 0 ? (
                      <img
                        src={design.images[0].url}
                        alt={design.images[0].alt_text || design.title}
                        className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {design.title}
                    </h3>
                    {design.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {design.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground text-lg">
              {searchQuery || selectedCategory !== "all" || selectedSubcategory !== "all"
                ? "No se encontraron diseños con los filtros seleccionados"
                : "No hay diseños disponibles todavía"}
            </p>
            {!searchQuery && selectedCategory === "all" && selectedSubcategory === "all" && (
              <Link to="/admin/designs">
                <Button className="gradient-primary text-white">
                  Crear primer diseño
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Admin Link (solo visible si está autenticado) */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6">
          <Link to="/admin">
            <Button size="lg" className="gradient-primary text-white shadow-hover">
              Admin Panel
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
