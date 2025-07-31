import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, Users, FileText, CircleDollarSign } from "lucide-react";
import { useExames, useExamesProximosVencimento } from "@/hooks/useExames";
import { useColaboradores } from "@/hooks/useColaboradores";

export const Dashboard = () => {
  const { data: exames } = useExames();
  const { data: examesProximos } = useExamesProximosVencimento();
  const { data: colaboradores } = useColaboradores();

  const examesTotais = exames?.length || 0;
  const examesVencidos = exames?.filter(e => e.status === 'vencido').length || 0;
  const examesProximosVencimento = exames?.filter(e => e.status === 'próximo_vencimento').length || 0;
  const colaboradoresAtivos = colaboradores?.length || 0;
  

  // 1. Calcular o valor total dos exames
  const valorTotalExames = exames?.reduce((acc, exame) => acc + (exame.valor || 0), 0) || 0;

  // 2. Formatar o valor para moeda brasileira
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotalExames);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard - Controle de Exames</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Colaboradores Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colaboradoresAtivos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Exames
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examesTotais}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos ao Vencimento
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{examesProximosVencimento}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Exames Vencidos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{examesVencidos}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Custo Total
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valorFormatado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {examesVencidos > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Existem {examesVencidos} exame(s) vencido(s) que precisam de atenção imediata!
          </AlertDescription>
        </Alert>
      )}

      {examesProximosVencimento > 0 && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            Existem {examesProximosVencimento} exame(s) próximo(s) ao vencimento.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Exames Próximos ao Vencimento */}
      <Card>
        <CardHeader>
          <CardTitle>Exames que Precisam de Atenção</CardTitle>
          <CardDescription>
            Exames vencidos ou próximos ao vencimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {examesProximos && examesProximos.length > 0 ? (
            <div className="space-y-3">
              {examesProximos.map((exame: any) => (
                <div key={exame.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{exame.colaboradores?.nome}</div>
                    <div className="text-sm text-muted-foreground">{exame.tipos_exames?.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      Vencimento: {new Date(exame.data_vencimento).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={exame.status === 'vencido' ? 'destructive' : 'default'}
                    >
                      {exame.status === 'vencido' ? 'Vencido' : 'Próximo ao Vencimento'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum exame próximo ao vencimento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};