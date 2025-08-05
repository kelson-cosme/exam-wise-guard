
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTiposExames, useDeleteTipoExame } from "@/hooks/useExames";
import { TipoExame } from "@/types/database";
import { TipoExameForm } from "./TipoExameForm";
import { Pencil, Trash2 } from "lucide-react";

export const TiposExamesList = () => {
  const { data: tiposExames, isLoading } = useTiposExames();
  const deleteTipoExame = useDeleteTipoExame();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTipoExame, setSelectedTipoExame] = useState<TipoExame | null>(null);

  const handleEdit = (tipo: TipoExame) => {
    setSelectedTipoExame(tipo);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteTipoExame.mutate(id);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Exames</CardTitle>
          <CardDescription>
            Todos os tipos de exames cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Carregando...</div>
          ) : tiposExames && tiposExames.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Dias para Alerta</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
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
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(tipo)}>
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
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o tipo de exame.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(tipo.id)}>
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
            <p className="text-muted-foreground">Nenhum tipo de exame cadastrado.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Exame</DialogTitle>
          </DialogHeader>
          <TipoExameForm 
            tipoExame={selectedTipoExame} 
            onFinish={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};