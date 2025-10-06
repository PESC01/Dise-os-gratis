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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useCreateDesign, useUpdateDesign, type Design } from "@/hooks/useDesigns";
import { useCategories } from "@/hooks/useCategories";
import { CloudinaryUpload } from "./CloudinaryUpload";

interface DesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design?: Design & { subcategories?: any[] };
}

export function DesignDialog({ open, onOpenChange, design }: DesignDialogProps) {
  const [title, setTitle] = useState(design?.title || "");
  const [description, setDescription] = useState(design?.description || "");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    design?.category_id || undefined
  );
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
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
      setCoverImageUrl(design.cover_image_url || "");
      setDownloadLink(design.download_link || "");
      
      // Set selected subcategories from the design
      const subcategoryIds = design.subcategories?.map(sub => sub.id) || [];
      setSelectedSubcategoryIds(subcategoryIds);
    }
  }, [design]);

  const selectedCategory = categories?.find((cat) => cat.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryIds(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const removeSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryIds(prev => prev.filter(id => id !== subcategoryId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (design) {
      await updateDesign.mutateAsync({
        id: design.id,
        title,
        description: description || undefined,
        category_id: categoryId,
        cover_image_url: coverImageUrl || undefined,
        download_link: downloadLink || undefined,
      });
    } else {
      await createDesign.mutateAsync({
        title,
        description: description || undefined,
        category_id: categoryId,
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
    setSelectedSubcategoryIds([]);
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
              <Label htmlFor="category">Categoría Principal *</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  setCategoryId(value);
                  setSelectedSubcategoryIds([]); // Limpiar subcategorías al cambiar categoría
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {categoryId && subcategories.length > 0 && (
              <div className="grid gap-2">
                <Label>Subcategorías (selecciona una o más)</Label>
                
                {/* Selected subcategories */}
                {selectedSubcategoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSubcategoryIds.map(subId => {
                      const subcategory = subcategories.find(s => s.id === subId);
                      return subcategory ? (
                        <Badge key={subId} variant="secondary" className="gap-1">
                          {subcategory.name}
                          <button
                            type="button"
                            onClick={() => removeSubcategory(subId)}
                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Subcategories list with checkboxes */}
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {subcategories.map((sub) => (
                    <div key={sub.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sub-${sub.id}`}
                        checked={selectedSubcategoryIds.includes(sub.id)}
                        onCheckedChange={() => toggleSubcategory(sub.id)}
                      />
                      <label
                        htmlFor={`sub-${sub.id}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {sub.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
