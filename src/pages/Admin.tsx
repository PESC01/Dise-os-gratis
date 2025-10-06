import { Link } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Image, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const Admin = () => {
  const { signOut, user } = useAuth();

  const adminSections = [
    {
      title: "Gestión de Diseños",
      description: "Crear, editar y eliminar diseños",
      icon: Image,
      href: "/admin/designs",
      color: "from-primary to-accent",
    },
    {
      title: "Gestión de Categorías",
      description: "Organizar categorías y subcategorías",
      icon: FolderKanban,
      href: "/admin/categories",
      color: "from-secondary to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "Gestiona tu galería de diseños"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al sitio
                </Button>
              </Link>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {adminSections.map((section, index) => (
            <Link
              key={section.title}
              to={section.href}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="h-full transition-smooth hover:shadow-hover transform hover:-translate-y-1 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${section.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${section.color} text-white shadow-card`}
                    >
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="group-hover:text-primary transition-smooth">
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 max-w-4xl mx-auto bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">✅ Sistema de Autenticación Activo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• ✅ Estás autenticado como: <strong>{user?.email}</strong></p>
            <p>• ✅ Las rutas del admin están protegidas</p>
            <p>• ✅ Solo usuarios autenticados pueden crear/editar/eliminar</p>
            <p>• ✅ El público puede ver los diseños pero no modificarlos</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
