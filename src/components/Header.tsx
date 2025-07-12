import { Heart } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white/50 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-romantic bg-clip-text text-transparent">
              Momentos
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Como funciona
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Exemplos
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};