import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useColaboradores } from "@/hooks/useColaboradores";
import { useExames } from "@/hooks/useExames";
import { useProcedimentos } from "@/hooks/useProcedimentos"; // Hook para buscar os procedimentos
import { ExameComDetalhes } from "@/types/database";
import { cn } from "@/lib/utils";

// Função para determinar a cor da célula
const getStatusClass = (status: 'válido' | 'vencido' | 'próximo_vencimento' | undefined) => {
  if (!status) return "bg-gray-50";
  switch (status) {
    case 'vencido': return 'bg-red-200 text-red-900';
    case 'próximo_vencimento': return 'bg-yellow-200 text-yellow-900';
    case 'válido': return 'bg-green-200 text-green-900';
    default: return "bg-gray-50";
  }
};

export const DashboardDetalhado = () => {
  const { data: colaboradores, isLoading: loadingColaboradores } = useColaboradores();
  const { data: procedimentos, isLoading: loadingProcedimentos } = useProcedimentos();
  const { data: exames, isLoading: loadingExames } = useExames();

  const isLoading = loadingColaboradores || loadingProcedimentos || loadingExames;

  // Mapeia o exame mais recente para cada combinação de colaborador e procedimento
  const examesPorProcedimento = React.useMemo(() => {
    if (!exames) return {};
    
    const map = new Map<string, ExameComDetalhes>();

    exames.forEach(exame => {
      exame.procedimentos?.forEach(procedimento => {
        const key = `${exame.colaborador_id}-${procedimento.id}`;
        const existingExame = map.get(key);

        if (!existingExame || new Date(exame.data_vencimento) > new Date(existingExame.data_vencimento)) {
          map.set(key, exame as ExameComDetalhes);
        }
      });
    });

    return Object.fromEntries(map);
  }, [exames]);

  if (isLoading) {
    return <div>Carregando dados de procedimentos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard de Procedimentos</CardTitle>
        <CardDescription>
          Visão geral da validade dos procedimentos realizados por cada colaborador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <Table className="min-w-full divide-y divide-gray-200 border-collapse">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="sticky left-0 bg-muted/50 z-10 border-b border-r w-48 whitespace-nowrap">Colaborador</TableHead>
                {procedimentos?.map(proc => (
                  <TableHead key={proc.id} className="text-center border-b border-r" colSpan={2}>{proc.nome}</TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead className="sticky left-0 bg-muted/50 z-10 border-r"></TableHead>
                {procedimentos?.map(proc => (
                  <React.Fragment key={`${proc.id}-sub`}>
                    <TableHead className="text-center border-b whitespace-nowrap">Validade</TableHead>
                    <TableHead className="text-center border-b border-r whitespace-nowrap">Dias</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores?.map(colaborador => (
                <TableRow key={colaborador.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium sticky left-0 bg-background hover:bg-muted/20 z-10 border-r whitespace-nowrap">
                    {colaborador.nome}
                  </TableCell>
                  {procedimentos?.map(proc => {
                    const exame = examesPorProcedimento?.[`${colaborador.id}-${proc.id}`];
                    const statusClass = getStatusClass(exame?.status);
                    return (
                      <React.Fragment key={`${colaborador.id}-${proc.id}`}>
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