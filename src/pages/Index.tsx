import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { ColaboradorForm } from "@/components/ColaboradorForm";
import { ColaboradoresList } from "@/components/ColaboradoresList";
import { ExameForm } from "@/components/ExameForm";
import { ExamesList } from "@/components/ExamesList";
import { TipoExameForm } from "@/components/TipoExameForm"; // 1. Importe os novos componentes
import { TiposExamesList } from "@/components/TiposExamesList";

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
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
      case 'tipos-exames': // Adicione este novo case
        return (
          <div className="space-y-6">
            <TipoExameForm />
            <TiposExamesList />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="md:ml-64 p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;