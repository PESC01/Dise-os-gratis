import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useCreateDesign, useUpdateDesign, type Design } from "@/hooks/useDesigns";
import { useCategories } from "@/hooks/useCategories";
import { CloudinaryUpload } from "./CloudinaryUpload";

interface DesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design?: Design & { categories?: any[] };
}

export function DesignDialog({ open, onOpenChange, design }: DesignDialogProps) {
  const [title, setTitle] = useState(design?.title || "");
  const [description, setDescription] = useState(design?.description || "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>(
    design?.category_id || undefined
  );
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(
    design?.subcategory_id || undefined
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string>(design?.cover_image_url || "");
  const [downloadLink, setDownloadLink] = useState<string>(design?.download_link || "");

  const { data: categories } = useCategories();
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();

  useEffect(() => {
    if (design) {
      setTitle(design.title);
      setDescription(design.description || "");
      setCategoryId(design.category_id || undefined);
      setSubcategoryId(design.subcategory_id || undefined);
      setCoverImageUrl(design.cover_image_url || "");
      setDownloadLink(design.download_link || "");
      
      // Set selected categories from the design
      const categoryIds = design.categories?.map(cat => cat.id) || [];
      setSelectedCategoryIds(categoryIds);
    }
  }, [design]);

  const selectedCategory = categories?.find((cat) => cat.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  // Get all categories (parents and children) in a flat array
  const allCategories = categories?.reduce((acc: any[], cat) => {
    acc.push(cat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      acc.push(...cat.subcategories);
    }
    return acc;
  }, []) || [];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (design) {
      await updateDesign.mutateAsync({
        id: design.id,
        title,
        description: description || undefined,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        category_ids: selectedCategoryIds,
        cover_image_url: coverImageUrl || undefined,
        download_link: downloadLink || undefined,
      });
    } else {
      await createDesign.mutateAsync({
        title,
        description: description || undefined,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        category_ids: selectedCategoryIds,
        cover_image_url: coverImageUrl || undefined,
        download_link: downloadLink || undefined,
      });
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategoryId(undefined);
    setSubcategoryId(undefined);
    setSelectedCategoryIds([]);
    setCoverImageUrl("");
    setDownloadLink("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{design ? "Editar Diseño" : "Nuevo Diseño"}</DialogTitle>
            <DialogDescription>
              {design
                ? "Modifica los detalles del diseño."
                : "Crea un nuevo diseño con sus imágenes y categorías."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Diseño Abstracto"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el diseño..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coverImage">Imagen de Portada (Cloudinary)</Label>
              <CloudinaryUpload
                onUploadSuccess={(url) => setCoverImageUrl(url)}
                currentImage={coverImageUrl}
                onRemove={() => setCoverImageUrl("")}
              />
              <p className="text-xs text-muted-foreground">
                Esta será la imagen principal que se mostrará en la galería (optimizada a WebP).
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="downloadLink">Enlace de Descarga *</Label>
              <Input
                id="downloadLink"
                value={downloadLink}
                onChange={(e) => setDownloadLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                type="url"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL externa donde está alojado el archivo para descargar (Google Drive, Dropbox, etc.)
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Categorías (selecciona una o más)</Label>
              
              {/* Selected categories */}
              {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCategoryIds.map(catId => {
                    const category = allCategories.find(c => c.id === catId);
                    return category ? (
                      <Badge key={catId} variant="secondary" className="gap-1">
                        {category.name}
                        <button
                          type="button"
                          onClick={() => removeCategory(catId)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Categories list with checkboxes */}
              <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-3">
                {categories?.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={selectedCategoryIds.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <label
                        htmlFor={`cat-${cat.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {cat.name}
                      </label>
                    </div>
                    
                    {/* Subcategories */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${sub.id}`}
                              checked={selectedCategoryIds.includes(sub.id)}
                              onCheckedChange={() => toggleCategory(sub.id)}
                            />
                            <label
                              htmlFor={`cat-${sub.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {sub.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createDesign.isPending || updateDesign.isPending}
            >
              {design ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
