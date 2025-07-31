import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useColaboradores } from "@/hooks/useColaboradores";
import { useExames } from "@/hooks/useExames";
import { useTiposExames } from "@/hooks/useExames";
import { cn } from "@/lib/utils";

// Função para determinar a cor da célula com base no status do exame
const getStatusClass = (status: 'válido' | 'vencido' | 'próximo_vencimento' | undefined) => {
  if (!status) return "bg-gray-50"; // Cinza claro para células vazias
  switch (status) {
    case 'vencido':
      return 'bg-red-200 text-red-900'; // Vermelho
    case 'próximo_vencimento':
      return 'bg-yellow-200 text-yellow-900'; // Amarelo
    case 'válido':
      return 'bg-green-200 text-green-900'; // Verde
    default:
      return "bg-gray-50";
  }
};

export const DashboardDetalhado = () => {
  const { data: colaboradores, isLoading: loadingColaboradores } = useColaboradores();
  const { data: tiposExames, isLoading: loadingTiposExames } = useTiposExames();
  const { data: exames, isLoading: loadingExames } = useExames();

  const isLoading = loadingColaboradores || loadingTiposExames || loadingExames;

  // Estrutura os dados para facilitar a busca
  const examesPorColaborador = exames?.reduce((acc, exame) => {
    const key = `${exame.colaborador_id}-${exame.tipo_exame_id}`;
    acc[key] = exame;
    return acc;
  }, {} as Record<string, typeof exames[number]>);


  if (isLoading) {
    return <div>Carregando dados detalhados...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Detalhado</CardTitle>
        <CardDescription>
          Visão geral completa dos exames de todos os colaboradores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <Table className="min-w-full divide-y divide-gray-200 border-collapse">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="sticky left-0 bg-muted/50 z-10 border-b border-r w-48">Colaborador</TableHead>
                <TableHead className="border-b border-r">Admissão</TableHead>
                <TableHead className="border-b border-r">Função</TableHead>
                {tiposExames?.map(tipo => (
                  <TableHead key={tipo.id} className="text-center border-b border-r" colSpan={2}>{tipo.nome}</TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead className="sticky left-0 bg-muted/50 z-10 border-r"></TableHead>
                <TableHead className="border-r"></TableHead>
                <TableHead className="border-r"></TableHead>
                {tiposExames?.map(tipo => (
                  <React.Fragment key={`${tipo.id}-sub`}>
                    <TableHead className="text-center border-b">Validade</TableHead>
                    <TableHead className="text-center border-b border-r">Dias</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores?.map(colaborador => (
                <TableRow key={colaborador.id} className="hover:bg-muted/20">
                  <TableCell className="border-r">{new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium sticky left-0 bg-background hover:bg-muted/20 z-10 border-r whitespace-nowrap">
                    {colaborador.nome}
                  </TableCell>
                  <TableCell className="border-r whitespace-nowrap">{colaborador.cargo}</TableCell>
                  {tiposExames?.map(tipo => {
                    const exame = examesPorColaborador?.[`${colaborador.id}-${tipo.id}`];
                    const statusClass = getStatusClass(exame?.status);
                    return (
                      <React.Fragment key={`${colaborador.id}-${tipo.id}`}>
                        <TableCell className={cn("text-center", statusClass)}>
                          {exame ? new Date(exame.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell className={cn("text-center font-bold border-r", statusClass)}>
                          {exame ? exame.dias_para_vencer : '-'}
                        </TableCell>
                      </React.Fragment>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};