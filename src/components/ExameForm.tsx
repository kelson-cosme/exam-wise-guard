// src/components/ExameForm.tsx

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
  const [validadeDias, setValidadeDias] = useState(""); // 1. Adicionar novo estado

  const { data: colaboradores } = useColaboradores();
  const { data: tiposExames } = useTiposExames();
  const createExame = useCreateExame();

  // 2. Alterar o useEffect para calcular com base no novo input
  useEffect(() => {
    if (dataRealizacao && validadeDias) {
      const dataReal = new Date(dataRealizacao);
      // Adiciona 1 dia ao cálculo para incluir o dia da realização corretamente
      dataReal.setDate(dataReal.getDate() + parseInt(validadeDias, 10) + 1);
      setDataVencimento(dataReal.toISOString().split('T')[0]);
    }
  }, [dataRealizacao, validadeDias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!colaboradorId || !tipoExameId || !dataRealizacao || !dataVencimento || !validadeDias) {
      return;
    }

    // 3. Adicionar validade_dias ao objeto enviado
    createExame.mutate({
      colaborador_id: colaboradorId,
      tipo_exame_id: tipoExameId,
      data_realizacao: dataRealizacao,
      data_vencimento: dataVencimento,
      validade_dias: parseInt(validadeDias, 10),
      observacoes: observacoes || undefined,
    });

    // Limpar formulário após sucesso
    if (createExame.isSuccess) {
      setColaboradorId("");
      setTipoExameId("");
      setDataRealizacao("");
      setDataVencimento("");
      setObservacoes("");
      setValidadeDias(""); // 4. Limpar o novo campo
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

            {/* 5. Adicionar o novo campo de input no formulário */}
            <div className="space-y-2">
              <Label htmlFor="validadeDias">Validade (dias) *</Label>
              <Input
                id="validadeDias"
                type="number"
                placeholder="Ex: 365"
                value={validadeDias}
                onChange={(e) => setValidadeDias(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={dataVencimento}
                readOnly // Data de vencimento agora é apenas leitura
                className="bg-muted"
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