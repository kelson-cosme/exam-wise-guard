import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, Users, FileText, CircleDollarSign } from "lucide-react";
import { useExames } from "@/hooks/useExames";
import { useColaboradores } from "@/hooks/useColaboradores";
import { ExameComDetalhes } from "@/types/database";
import { cn } from "@/lib/utils";

export const Dashboard = () => {
  const { data: todosExames, isLoading: loadingExames } = useExames();
  const { data: colaboradores, isLoading: loadingColaboradores } = useColaboradores();

  // Filtra para considerar apenas o exame mais recente de cada tipo por colaborador
  const examesAtivos = React.useMemo(() => {
    if (!todosExames) return [];
    
    const maisRecentesMap = new Map<string, ExameComDetalhes>();

    todosExames.forEach(exame => {
      const key = `${exame.colaborador_id}-${exame.tipo_exame_id}`;
      const existente = maisRecentesMap.get(key);

      if (!existente || new Date(exame.data_vencimento) > new Date(existente.data_vencimento)) {
        maisRecentesMap.set(key, exame);
      }
    });

    return Array.from(maisRecentesMap.values());
  }, [todosExames]);

  // A lista de atenção agora é derivada dos examesAtivos
  const examesQuePrecisamAtencao = examesAtivos
    .filter(e => e.status === 'vencido' || e.status === 'próximo_vencimento')
    .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

  // As estatísticas continuam baseadas nos exames ativos
  const examesTotaisAtivos = examesAtivos.length;
  const examesVencidos = examesAtivos.filter(e => e.status === 'vencido').length;
  const examesProximosVencimento = examesAtivos.filter(e => e.status === 'próximo_vencimento').length;
  const colaboradoresAtivos = colaboradores?.length || 0;
  const valorTotalExames = todosExames?.reduce((acc, exame) => acc + (exame.valor || 0), 0) || 0;

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotalExames);

  const isLoading = loadingColaboradores || loadingExames;

  if (isLoading) {
    return <div>Carregando Dashboard...</div>
  }

  // Função para obter a cor do status para o indicador
  const getStatusColorClass = (status: 'válido' | 'vencido' | 'próximo_vencimento') => {
    switch (status) {
      case 'vencido': return 'bg-red-500';
      case 'próximo_vencimento': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard - Controle de Exames</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Cards de Estatísticas */}
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{colaboradoresAtivos}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Exames Ativos</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{examesTotaisAtivos}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Próximos ao Vencimento</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{examesProximosVencimento}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Exames Vencidos</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{examesVencidos}</div></CardContent></Card>
        <Card className="lg:col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Custo Total (Histórico)</CardTitle><CircleDollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{valorFormatado}</div></CardContent></Card>
      </div>

      {/* Alertas */}
      {examesVencidos > 0 && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>Existem {examesVencidos} exame(s) ativo(s) vencido(s) que precisam de atenção imediata!</AlertDescription></Alert>)}
      {examesProximosVencimento > 0 && (<Alert><Calendar className="h-4 w-4" /><AlertDescription>Existem {examesProximosVencimento} exame(s) ativo(s) próximo(s) ao vencimento.</AlertDescription></Alert>)}

      {/* Card de Atenção com Legenda */}
      <Card>
        <CardHeader>
          <CardTitle>Exames que Precisam de Atenção</CardTitle>
          <CardDescription>
            Exames vencidos ou próximos ao vencimento (apenas os mais recentes de cada tipo).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legenda */}
          <div className="flex justify-end items-center space-x-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center"><div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>Exames em dia</div>
            <div className="flex items-center"><div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>Exames a vencer</div>
            <div className="flex items-center"><div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>Exames vencidos</div>
          </div>

          {/* Lista de Exames */}
          {examesQuePrecisamAtencao && examesQuePrecisamAtencao.length > 0 ? (
            <div className="space-y-3">
              {examesQuePrecisamAtencao.map((exame) => (
                <div key={exame.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className={cn("h-3 w-3 rounded-full mr-4", getStatusColorClass(exame.status))}></div>
                    <div className="flex-1">
                      <div className="font-medium">{exame.colaborador_nome}</div>
                      <div className="text-sm text-muted-foreground">{exame.tipo_exame_nome}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Vence em: {new Date(exame.data_vencimento).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center p-4">Nenhum exame vencido ou próximo ao vencimento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};