import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDesign } from "@/hooks/useDesigns";

const DesignDetail = () => {
  const { id } = useParams();
  const [showAdModal, setShowAdModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [shouldActivatePopunder, setShouldActivatePopunder] = useState(true); // Alterna el popunder
  const [popunderActive, setPopunderActive] = useState(false); // Indica si el popunder está activo para este ciclo

  // Obtener diseño real de Supabase
  const { data: design, isLoading } = useDesign(id || "");

  useEffect(() => {
    if (showAdModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAdModal, countdown]);

  // Cargar el script del native banner cuando se abre el modal
  useEffect(() => {
    if (showAdModal) {
      const script = document.createElement('script');
      script.src = '//pl27790913.revenuecpmgate.com/81cb0cb805a777612ec57f2d571fda99/invoke.js';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);

      return () => {
        // Limpiar el script cuando se cierre el modal
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showAdModal]);

  const handleDownloadClick = () => {
    // Determinar si activar el popunder en este clic (de manera intercalada)
    if (shouldActivatePopunder) {
      // Activar el popunder en ESTE clic
      setPopunderActive(true);
      setShouldActivatePopunder(false); // Próximo clic NO activará el popunder
      
      // Cargar el script del popunder SOLO cuando debe activarse
      const popunderScript = document.createElement('script');
      popunderScript.type = 'text/javascript';
      popunderScript.src = '//pl27790861.revenuecpmgate.com/b7/28/1d/b7281d1ec569051b2883dffa7f970b09.js';
      popunderScript.id = 'popunder-script-active'; // ID para identificarlo
      document.body.appendChild(popunderScript);
    } else {
      // NO activar el popunder en este clic
      setPopunderActive(false);
      setShouldActivatePopunder(true); // Próximo clic SÍ activará el popunder
    }
    
    // SIEMPRE mostrar el modal con native banner y espera de 5 segundos
    setShowAdModal(true);
    setCountdown(5);
  };

  const handleProceedToDownload = () => {
    if (countdown === 0 && design) {
      const downloadUrl = (design as any).download_link;
      
      if (downloadUrl) {
        // Abrir el enlace de descarga
        window.open(downloadUrl, "_blank");
        setShowAdModal(false);
        
        // Limpiar el popunder si estaba activo
        if (popunderActive) {
          setTimeout(() => {
            const popunderScript = document.getElementById('popunder-script-active');
            if (popunderScript && document.body.contains(popunderScript)) {
              document.body.removeChild(popunderScript);
            }
            setPopunderActive(false);
          }, 1000);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando diseño...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Diseño no encontrado</h2>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la galería
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Obtener nombres de categorías (si existen)
  const categoryName = (design as any).categories?.name || "Sin categoría";
  const subcategoryName = (design as any).subcategories?.name || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la galería
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images Gallery */}
          <div className="space-y-4 animate-fade-in">
            {(design as any).cover_image_url ? (
              <div className="aspect-square rounded-xl overflow-hidden shadow-card">
                <img
                  src={(design as any).cover_image_url}
                  alt={(design as any).title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-xl overflow-hidden shadow-card bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Sin imagen disponible</p>
              </div>
            )}
          </div>

          {/* Design Info */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                {categoryName && (
                  <>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {categoryName}
                    </span>
                    {subcategoryName && (
                      <>
                        <span>•</span>
                        <span>{subcategoryName}</span>
                      </>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {(design as any).title}
              </h1>
              {(design as any).description && (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {(design as any).description}
                </p>
              )}
            </div>

            <Card className="gradient-primary text-white border-0">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Descargar Diseño</h3>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90"
                  onClick={handleDownloadClick}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Descargar Ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Ad Modal */}
      <Dialog open={showAdModal} onOpenChange={setShowAdModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preparando tu descarga</DialogTitle>
            <DialogDescription>
              Por favor espera {countdown} segundos antes de continuar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Native Banner Ad */}
            <div className="min-h-[250px] rounded-lg overflow-hidden">
              <div id="container-81cb0cb805a777612ec57f2d571fda99"></div>
            </div>

            <Button
              className="w-full"
              disabled={countdown > 0}
              onClick={handleProceedToDownload}
            >
              {countdown > 0 ? `Espera ${countdown}s...` : "Continuar a la descarga"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignDetail;
