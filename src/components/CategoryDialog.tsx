import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCategory, useUpdateCategory, type Category } from "@/hooks/useCategories";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  parentCategories?: Category[];
  isSubcategory?: boolean;
  parentId?: string;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  parentCategories = [],
  isSubcategory = false,
  parentId,
}: CategoryDialogProps) {
  const [name, setName] = useState(category?.name || "");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    category?.parent_id || parentId || undefined
  );

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (category) {
      await updateCategory.mutateAsync({
        id: category.id,
        name,
      });
    } else {
      await createCategory.mutateAsync({
        name,
        parent_id: isSubcategory ? selectedParentId : null,
      });
    }

    onOpenChange(false);
    setName("");
    setSelectedParentId(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {category
                ? "Editar Categoría"
                : isSubcategory
                  ? "Nueva Subcategoría"
                  : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {category
                ? "Modifica el nombre de la categoría."
                : isSubcategory
                  ? "Crea una nueva subcategoría dentro de una categoría principal."
                  : "Crea una nueva categoría principal."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Prendas, Tazas, etc."
                required
              />
            </div>
            {!category && isSubcategory && (
              <div className="grid gap-2">
                <Label htmlFor="parent">Categoría Principal</Label>
                <Select
                  value={selectedParentId}
                  onValueChange={setSelectedParentId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {category ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
