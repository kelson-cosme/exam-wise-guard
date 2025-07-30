import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTiposExames } from "@/hooks/useExames";

export const TiposExamesList = () => {
  const { data: tiposExames, isLoading } = useTiposExames();

  if (isLoading) {
    return <div>Carregando tipos de exames...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Tipos de Exames</CardTitle>
        <CardDescription>
          Todos os tipos de exames cadastrados no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tiposExames && tiposExames.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Dias para Alerta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiposExames.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell className="font-medium">{tipo.nome}</TableCell>
                    <TableCell>{tipo.descricao || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tipo.dias_alerta} dias</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum tipo de exame cadastrado.</p>
        )}
      </CardContent>
    </Card>
  );
};