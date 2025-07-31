import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { ColaboradorForm } from "@/components/ColaboradorForm";
import { ColaboradoresList } from "@/components/ColaboradoresList";
import { ExameForm } from "@/components/ExameForm";
import { ExamesList } from "@/components/ExamesList";
import { TipoExameForm } from "@/components/TipoExameForm";
import { TiposExamesList } from "@/components/TiposExamesList";
import { DashboardDetalhado } from "@/components/DashboardDetalhado";
import { ProcedimentoForm } from "@/components/ProcedimentoForm"; // Importe os novos componentes
import { cn } from "@/lib/utils";
import { ProcedimentosList } from "@/components/ProcedimentosList";

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // 1. Adicionar estado

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'dashboard-detalhado':
        return <DashboardDetalhado />;
      case 'colaboradores':
        return (
          <div className="space-y-6">
            <ColaboradorForm />
            <ColaboradoresList />
          </div>
        );
      case 'exames':
        return <ExameForm />;
      case 'lista-exames':
        return <ExamesList />;
      case 'tipos-exames':
        return (
          <div className="space-y-6">
            <TipoExameForm />
            <TiposExamesList />
          </div>
        );
        case 'procedimentos': // Adicione este novo case
        return (
          <div className="space-y-6">
            <ProcedimentoForm />
            <ProcedimentosList />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 2. Passar o estado e a função de toggle para a Navegação */}
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* 3. Ajustar a margem do conteúdo principal dinamicamente */}
      <main className={cn(
        "p-6 transition-[margin-left] duration-300 ease-in-out",
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;