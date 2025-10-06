import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
}

export const CloudinaryUpload = ({ 
  onUploadSuccess, 
  currentImage,
  onRemove 
}: CloudinaryUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  // Configuración de Cloudinary desde .env
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no debe superar los 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'designs');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al subir la imagen');
      }

      const data = await response.json();
      
      // Generar URL optimizada con transformaciones
      const optimizedUrl = data.secure_url.replace(
        '/upload/',
        '/upload/q_auto,f_webp,w_800/'
      );

      setPreview(optimizedUrl);
      onUploadSuccess(optimizedUrl);
      setError(null);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen. Verifica tu configuración de Cloudinary.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (onRemove) onRemove();
  };

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          ⚠️ Configura Cloudinary en el archivo .env:
          <br />
          <code className="text-xs bg-yellow-100 px-2 py-1 rounded mt-2 block">
            VITE_CLOUDINARY_CLOUD_NAME=tdndubzm8r
            <br />
            VITE_CLOUDINARY_UPLOAD_PRESET=designs_preset
          </code>
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <Card className="p-3 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">⚠️ {error}</p>
        </Card>
      )}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="mt-2 text-xs text-muted-foreground">
            ✓ Imagen optimizada en WebP guardada en Cloudinary
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 mb-3 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Subiendo a Cloudinary...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click para seleccionar</span> imagen de tu PC
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WebP (máx. 10MB)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};
