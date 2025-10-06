import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type Design = Tables<"designs">;
export type Image = Tables<"images">;
export type Category = Tables<"categories">;

export type DesignWithDetails = Design & {
  images?: Image[];
  category?: Category;
  subcategories?: Category[];
};

// Fetch all designs
export const useDesigns = () => {
  return useQuery({
    queryKey: ["designs"],
    queryFn: async () => {
      const { data: designs, error } = await supabase
        .from("designs")
        .select(`
          *,
          images (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Return designs as-is for now
      return (designs || []) as DesignWithDetails[];
    },
  });
};

// Fetch a single design
export const useDesign = (id: string) => {
  return useQuery({
    queryKey: ["designs", id],
    queryFn: async () => {
      const { data: design, error } = await supabase
        .from("designs")
        .select(`
          *,
          images (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      return design;
    },
    enabled: !!id,
  });
};

// Create a new design
export const useCreateDesign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      category_id?: string;
      subcategory_ids?: string[];
      cover_image_url?: string;
      download_link?: string;
      images?: { url: string; alt_text?: string; display_order?: number }[];
    }) => {
      const { images, subcategory_ids, ...designData } = data;

      // @ts-ignore - Supabase types will be generated after tables are created
      const { data: design, error: designError } = await supabase
        .from("designs")
        .insert([designData])
        .select()
        .single();

      if (designError) throw designError;

      // Insert subcategory relationships
      if (subcategory_ids && subcategory_ids.length > 0) {
        const subcategoryRelations = subcategory_ids.map(subcategory_id => ({
          design_id: design!.id,
          subcategory_id
        }));

        // @ts-ignore
        const { error: subcategoriesError } = await supabase
          .from("design_subcategories")
          .insert(subcategoryRelations);

        if (subcategoriesError) throw subcategoriesError;
      }

      // Insert images if provided
      if (images && images.length > 0) {
        const imagesWithDesignId = images.map((img, index) => ({
          ...img,
          design_id: design!.id,
          display_order: img.display_order ?? index,
        }));

        // @ts-ignore - Supabase types will be generated after tables are created
        const { error: imagesError } = await supabase
          .from("images")
          .insert(imagesWithDesignId);

        if (imagesError) throw imagesError;
      }

      return design;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      toast({
        title: "Diseño creado",
        description: "El diseño se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el diseño: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Update a design
export const useUpdateDesign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      subcategory_ids,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      category_id?: string;
      subcategory_id?: string;
      subcategory_ids?: string[];
      cover_image_url?: string;
      download_link?: string;
    }) => {
      // @ts-ignore - Supabase types will be generated after tables are created
      const { data: design, error } = await supabase
        .from("designs")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update subcategory relationships if provided
      if (subcategory_ids !== undefined) {
        // First, delete all existing relationships
        // @ts-ignore
        const { error: deleteError } = await supabase
          .from("design_subcategories")
          .delete()
          .eq("design_id", id);

        if (deleteError) throw deleteError;

        // Then, insert new relationships
        if (subcategory_ids.length > 0) {
          const subcategoryRelations = subcategory_ids.map(subcategory_id => ({
            design_id: id,
            subcategory_id
          }));

          // @ts-ignore
          const { error: insertError } = await supabase
            .from("design_subcategories")
            .insert(subcategoryRelations);

          if (insertError) throw insertError;
        }
      }

      return design;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      toast({
        title: "Diseño actualizado",
        description: "El diseño se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el diseño: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Delete a design
export const useDeleteDesign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("designs").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      toast({
        title: "Diseño eliminado",
        description: "El diseño se ha eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el diseño: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Add image to design
export const useAddImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      design_id: string;
      url: string;
      alt_text?: string;
      display_order?: number;
    }) => {
      // @ts-ignore - Supabase types will be generated after tables are created
      const { data: image, error } = await supabase
        .from("images")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return image;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      queryClient.invalidateQueries({ queryKey: ["designs", variables.design_id] });
      toast({
        title: "Imagen agregada",
        description: "La imagen se ha agregado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo agregar la imagen: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Delete image
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("images").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la imagen: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
