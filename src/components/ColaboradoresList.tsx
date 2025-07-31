import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useColaboradores, useDeleteColaborador } from "@/hooks/useColaboradores";
import { Colaborador } from "@/types/database";
import { ColaboradorForm } from "./ColaboradorForm";
import { Pencil, Trash2 } from "lucide-react";

export const ColaboradoresList = () => {
  const { data: colaboradores, isLoading } = useColaboradores();
  const deleteColaborador = useDeleteColaborador();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);

  const handleEdit = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteColaborador.mutate(id);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
          <CardDescription>
            Todos os colaboradores cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Carregando colaboradores...</div>
          ) : colaboradores && colaboradores.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Data Admissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
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
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(colaborador)}>
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
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o colaborador e todos os seus exames associados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(colaborador.id)}>
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
            <p className="text-muted-foreground">Nenhum colaborador cadastrado.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          <ColaboradorForm 
            colaborador={selectedColaborador} 
            onFinish={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};