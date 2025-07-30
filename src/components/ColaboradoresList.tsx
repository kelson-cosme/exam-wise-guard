import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useColaboradores } from "@/hooks/useColaboradores";

export const ColaboradoresList = () => {
  const { data: colaboradores, isLoading } = useColaboradores();

  if (isLoading) {
    return <div>Carregando colaboradores...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Colaboradores</CardTitle>
        <CardDescription>
          Todos os colaboradores cadastrados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {colaboradores && colaboradores.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Data Admissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell className="font-medium">
                      {colaborador.nome}
                    </TableCell>
                    <TableCell>{colaborador.cargo || '-'}</TableCell>
                    <TableCell>{colaborador.setor || '-'}</TableCell>
                    <TableCell>
                      {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={colaborador.ativo ? "default" : "secondary"}>
                        {colaborador.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum colaborador cadastrado.</p>
        )}
      </CardContent>
    </Card>
  );
};