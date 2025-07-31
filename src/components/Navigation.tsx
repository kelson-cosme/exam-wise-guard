import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home, Users, FileText, Calendar, Menu, X, Settings, LayoutDashboard, ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Navigation = ({ currentView, onViewChange, isCollapsed, toggleCollapse }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'dashboard-detalhado', label: 'Dashboard Detalhado', icon: LayoutDashboard },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
    { id: 'exames', label: 'Registrar Exame', icon: FileText },
    { id: 'lista-exames', label: 'Lista de Exames', icon: Calendar },
    { id: 'tipos-exames', label: 'Tipos de Exame', icon: Settings },
  ];

  const handleViewChange = (view: string) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Botão do menu mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Barra de Navegação */}
      <nav className={cn(
        "fixed left-0 top-0 h-full bg-card border-r flex flex-col transition-[width] duration-300 ease-in-out z-40",
        // Estilos para mobile (escondido/mostrado)
        isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
        // Estilos para desktop (recolhido/expandido)
        "md:translate-x-0",
        isCollapsed ? "md:w-20" : "md:w-64"
      )}>
        <div className="flex-1 overflow-y-auto">
          <div className={cn("flex items-center p-6", isCollapsed ? 'justify-center' : 'justify-between')}>
            <h2 className={cn("text-2xl font-bold transition-opacity", isCollapsed && "md:opacity-0 md:hidden")}>Controle</h2>
          </div>
          
          <div className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const buttonContent = (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={cn("w-full justify-start", isCollapsed && "md:justify-center")}
                  onClick={() => handleViewChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className={cn("ml-2 transition-all", isCollapsed && "md:hidden")}>{item.label}</span>
                </Button>
              );

              return isCollapsed ? (
                <Tooltip key={`${item.id}-tooltip`}>
                  <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                buttonContent
              );
            })}
          </div>
        </div>

        {/* Botão para Recolher/Expandir (apenas desktop) */}
        <div className="hidden md:flex p-4 mt-auto">
          <Button variant="ghost" className="w-full justify-start" onClick={toggleCollapse}>
             <ChevronsLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
             <span className={cn("ml-2 transition-all", isCollapsed && "md:hidden")}>Recolher</span>
          </Button>
        </div>
      </nav>

      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </TooltipProvider>
  );
};