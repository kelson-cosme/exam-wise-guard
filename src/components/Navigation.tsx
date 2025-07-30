import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Users, FileText, Calendar, Menu, X, Settings } from "lucide-react"; // 1. Adicione o ícone "Settings"
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
    { id: 'exames', label: 'Registrar Exame', icon: FileText },
    { id: 'lista-exames', label: 'Lista de Exames', icon: Calendar },
    { id: 'tipos-exames', label: 'Tipos de Exame', icon: Settings }, // 2. Adicione esta linha
  ]

  const handleViewChange = (view: string) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out z-40",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Controle de Exames</h2>
          
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleViewChange(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};