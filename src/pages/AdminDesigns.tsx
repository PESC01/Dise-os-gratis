import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DesignDialog } from "@/components/DesignDialog";
import { useDesigns, useDeleteDesign, type Design } from "@/hooks/useDesigns";

const AdminDesigns = () => {
  const [designDialogOpen, setDesignDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<string | undefined>();

  const { data: designs, isLoading } = useDesigns();
  const deleteDesign = useDeleteDesign();

  const handleNewDesign = () => {
    setSelectedDesign(undefined);
    setDesignDialogOpen(true);
  };

  const handleEditDesign = (design: Design) => {
    setSelectedDesign(design);
    setDesignDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDesignToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (designToDelete) {
      await deleteDesign.mutateAsync(designToDelete);
      setDeleteDialogOpen(false);
      setDesignToDelete(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Gestión de Diseños</h1>
            </div>
            <Button className="gradient-primary text-white" onClick={handleNewDesign}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Diseño
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : designs && designs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <Card
                key={design.id}
                className="overflow-hidden hover:shadow-hover transition-smooth"
              >
                {(design as any).cover_image_url ? (
                  <div
                    className="aspect-video bg-muted bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${(design as any).cover_image_url})`,
                    }}
                  />
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Sin imagen</span>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold">{design.title}</h3>
                    {design.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {design.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditDesign(design)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteClick(design.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay diseños creados todavía
            </p>
            <Button onClick={handleNewDesign}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer diseño
            </Button>
          </Card>
        )}
      </main>

      <DesignDialog
        open={designDialogOpen}
        onOpenChange={setDesignDialogOpen}
        design={selectedDesign}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el diseño
              y todas sus imágenes asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDesigns;
