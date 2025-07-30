import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExames } from "@/hooks/useExames";

const getStatusBadge = (status: string, diasParaVencer: number) => {
  if (status === 'vencido') {
    return <Badge variant="destructive">Vencido</Badge>;
  } else if (status === 'próximo_vencimento') {
    return <Badge variant="secondary">Vence em {diasParaVencer} dias</Badge>;
  } else {
    return <Badge variant="default">Válido</Badge>;
  }
};

export const ExamesList = () => {
  const { data: exames, isLoading } = useExames();

  if (isLoading) {
    return <div>Carregando exames...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Exames</CardTitle>
        <CardDescription>
          Todos os exames registrados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {exames && exames.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Tipo de Exame</TableHead>
                  <TableHead>Data Realização</TableHead>
                  <TableHead>Data Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exames.map((exame) => (
                  <TableRow key={exame.id}>
                    <TableCell className="font-medium">
                      {exame.colaborador_nome}
                    </TableCell>
                    <TableCell>{exame.tipo_exame_nome}</TableCell>
                    <TableCell>
                      {new Date(exame.data_realizacao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {new Date(exame.data_vencimento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(exame.status, exame.dias_para_vencer)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {exame.observacoes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum exame registrado.</p>
        )}
      </CardContent>
    </Card>
  );
};