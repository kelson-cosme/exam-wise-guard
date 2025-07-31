import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExames, useDeleteExame } from "@/hooks/useExames";
import { Exame, ExameComDetalhes } from "@/types/database";
import { ExameForm } from "./ExameForm";
import { Pencil, Trash2, RotateCw } from "lucide-react";

// LÓGICA DO BADGE ATUALIZADA
const getStatusBadge = (status: string, diasParaVencer: number, isHistorico: boolean = false) => {
  if (isHistorico) {
    return <Badge variant="outline">Baixado</Badge>;
  }
  if (status === 'vencido') {
    return <Badge variant="destructive">Vencido</Badge>;
  } else if (status === 'próximo_vencimento') {
    return <Badge variant="secondary">Vence em {diasParaVencer} dias</Badge>;
  } else {
    return <Badge variant="default">Válido</Badge>;
  }
};

export const ExamesList = () => {
  const { data: todosExames, isLoading } = useExames();
  const deleteExame = useDeleteExame();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);

  // Agrupa todos os exames por colaborador
  const examesPorColaborador = useMemo(() => {
    if (!todosExames) return {};
    return todosExames.reduce((acc, exame) => {
      const colaboradorNome = (exame as ExameComDetalhes).colaborador_nome;
      if (!acc[colaboradorNome]) {
        acc[colaboradorNome] = [];
      }
      acc[colaboradorNome].push(exame);
      return acc;
    }, {} as Record<string, ExameComDetalhes[]>);
  }, [todosExames]);

  const handleEdit = (exame: Exame) => {
    setSelectedExame(exame);
    setIsEditDialogOpen(true);
  };

  const handleRenew = (exame: Exame) => {
    setSelectedExame(exame);
    setIsRenewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExame.mutate(id);
  };

  // Separa os exames em ativos (o mais recente de cada tipo) e histórico (os demais)
  const separarExames = (listaDeExames: ExameComDetalhes[]) => {
    const maisRecentesMap = new Map<string, ExameComDetalhes>();

    listaDeExames.forEach(exame => {
      const existente = maisRecentesMap.get(exame.tipo_exame_id);
      if (!existente || new Date(exame.data_vencimento) > new Date(existente.data_vencimento)) {
        maisRecentesMap.set(exame.tipo_exame_id, exame);
      }
    });

    const examesAtivos = Array.from(maisRecentesMap.values());
    const idsDosAtivos = new Set(examesAtivos.map(e => e.id));
    const examesHistorico = listaDeExames.filter(e => !idsDosAtivos.has(e.id));

    return { examesAtivos, examesHistorico };
  };

  const renderExamesTable = (listaExames: ExameComDetalhes[], isHistorico: boolean = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo de Exame</TableHead>
          <TableHead>Natureza</TableHead> {/* Adicionar esta coluna */}
          <TableHead>Data Realização</TableHead>
          <TableHead>Data Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listaExames.sort((a, b) => new Date(b.data_realizacao).getTime() - new Date(a.data_realizacao).getTime())
          .map((exame) => (
          <TableRow key={exame.id}>
            <TableCell>{exame.tipo_exame_nome}</TableCell>
            <TableCell>{exame.natureza || '-'}</TableCell> {/* Adicionar esta célula */}
            <TableCell>{new Date(exame.data_realizacao).toLocaleDateString('pt-BR')}</TableCell>
            <TableCell>{new Date(exame.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
            <TableCell>{getStatusBadge(exame.status, exame.dias_para_vencer, isHistorico)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleRenew(exame)} title="Renovar Exame">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleEdit(exame)} title="Editar Exame">
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" title="Excluir Exame">
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
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Exames por Colaborador</CardTitle>
          <CardDescription>
            Visualize os exames ativos e o histórico completo de cada colaborador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Carregando exames...</div>
          ) : examesPorColaborador && Object.keys(examesPorColaborador).length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(examesPorColaborador).map(([nome, listaCompleta]) => {
                const { examesAtivos, examesHistorico } = separarExames(listaCompleta);

                return (
                  <AccordionItem value={nome} key={nome}>
                    <AccordionTrigger>{nome}</AccordionTrigger>
                    <AccordionContent>
                      <Tabs defaultValue="ativos">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="ativos">Ativos ({examesAtivos.length})</TabsTrigger>
                          <TabsTrigger value="baixados">Histórico ({examesHistorico.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ativos">
                          {examesAtivos.length > 0 ? renderExamesTable(examesAtivos, false) : <p className="p-4 text-center text-muted-foreground">Nenhum exame ativo.</p>}
                        </TabsContent>
                        <TabsContent value="baixados">
                          {examesHistorico.length > 0 ? renderExamesTable(examesHistorico, true) : <p className="p-4 text-center text-muted-foreground">Nenhum exame no histórico.</p>}
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">Nenhum exame registrado.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}><DialogContent><DialogHeader><DialogTitle>Editar Registro de Exame</DialogTitle></DialogHeader><ExameForm exame={selectedExame} onFinish={() => setIsEditDialogOpen(false)} /></DialogContent></Dialog>
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}><DialogContent><DialogHeader><DialogTitle>Renovar Exame</DialogTitle></DialogHeader><ExameForm exame={selectedExame} onFinish={() => setIsRenewDialogOpen(false)} isRenewal={true} /></DialogContent></Dialog>
    </>
  );
};