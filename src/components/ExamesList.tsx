import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useExames, useDeleteExame } from "@/hooks/useExames";
import { Exame } from "@/types/database";
import { ExameForm } from "./ExameForm";
import { Pencil, Trash2 } from "lucide-react";

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
  const deleteExame = useDeleteExame();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);

  const handleEdit = (exame: Exame) => {
    setSelectedExame(exame);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExame.mutate(id);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Exames</CardTitle>
          <CardDescription>
            Todos os exames registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Carregando exames...</div>
          ) : exames && exames.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Tipo de Exame</TableHead>
                    <TableHead>Data Realização</TableHead>
                    <TableHead>Data Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exames.map((exame) => (
                    <TableRow key={exame.id}>
                      <TableCell className="font-medium">{exame.colaborador_nome}</TableCell>
                      <TableCell>{exame.tipo_exame_nome}</TableCell>
                      <TableCell>{new Date(exame.data_realizacao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{new Date(exame.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(exame.status, exame.dias_para_vencer)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(exame)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro deste exame.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(exame.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro de Exame</DialogTitle>
          </DialogHeader>
          <ExameForm
            exame={selectedExame}
            onFinish={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};