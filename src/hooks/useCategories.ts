import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;

export type CategoryWithSubcategories = Category & {
  subcategories?: (Category & { designCount?: number })[];
  designCount?: number;
};

// Fetch all categories with their subcategories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      if (!categories) return [];

      // Organize into parent categories with subcategories
      const parentCategories = categories.filter((cat: any) => !cat.parent_id);
      const result: CategoryWithSubcategories[] = await Promise.all(
        parentCategories.map(async (parent: any) => {
          const subcategories = categories.filter(
            (cat: any) => cat.parent_id === parent.id
          );

          // Count designs for each subcategory
          const subcategoriesWithCount = await Promise.all(
            subcategories.map(async (sub: any) => {
              const { count } = await supabase
                .from("designs")
                .select("*", { count: "exact", head: true })
                .eq("subcategory_id", sub.id);

              return { ...sub, designCount: count || 0 };
            })
          );

          return {
            ...parent,
            subcategories: subcategoriesWithCount,
          };
        })
      );

      return result;
    },
  });
};

// Create a new category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; parent_id?: string | null }) => {
      // @ts-ignore - Supabase types will be generated after tables are created
      const { data: category, error } = await supabase
        .from("categories")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string }) => {
      // @ts-ignore - Supabase types will be generated after tables are created
      const { data: category, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
