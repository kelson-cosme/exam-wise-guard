import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateExame, useTiposExames } from "@/hooks/useExames";
import { useColaboradores } from "@/hooks/useColaboradores";

export const ExameForm = () => {
  const [colaboradorId, setColaboradorId] = useState("");
  const [tipoExameId, setTipoExameId] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: colaboradores } = useColaboradores();
  const { data: tiposExames } = useTiposExames();
  const createExame = useCreateExame();

  // Calcular data de vencimento automaticamente
  useEffect(() => {
    if (dataRealizacao && tipoExameId) {
      const tipoExame = tiposExames?.find(t => t.id === tipoExameId);
      if (tipoExame) {
        const dataReal = new Date(dataRealizacao);
        dataReal.setMonth(dataReal.getMonth() + tipoExame.validade_meses);
        setDataVencimento(dataReal.toISOString().split('T')[0]);
      }
    }
  }, [dataRealizacao, tipoExameId, tiposExames]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!colaboradorId || !tipoExameId || !dataRealizacao || !dataVencimento) {
      return;
    }

    createExame.mutate({
      colaborador_id: colaboradorId,
      tipo_exame_id: tipoExameId,
      data_realizacao: dataRealizacao,
      data_vencimento: dataVencimento,
      observacoes: observacoes || undefined,
    });

    // Limpar formulário após sucesso
    if (createExame.isSuccess) {
      setColaboradorId("");
      setTipoExameId("");
      setDataRealizacao("");
      setDataVencimento("");
      setObservacoes("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Exame</CardTitle>
        <CardDescription>
          Registre um novo exame ou treinamento para um colaborador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="colaborador">Colaborador *</Label>
              <Select value={colaboradorId} onValueChange={setColaboradorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores?.map((colaborador) => (
                    <SelectItem key={colaborador.id} value={colaborador.id}>
                      {colaborador.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipoExame">Tipo de Exame *</Label>
              <Select value={tipoExameId} onValueChange={setTipoExameId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de exame" />
                </SelectTrigger>
                <SelectContent>
                  {tiposExames?.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataRealizacao">Data de Realização *</Label>
              <Input
                id="dataRealizacao"
                type="date"
                value={dataRealizacao}
                onChange={(e) => setDataRealizacao(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre o exame..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={createExame.isPending}
          >
            {createExame.isPending ? "Registrando..." : "Registrar Exame"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};