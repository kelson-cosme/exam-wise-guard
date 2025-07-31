import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateExame, useUpdateExame, useTiposExames } from "@/hooks/useExames";
import { useColaboradores } from "@/hooks/useColaboradores";
import { Exame } from "@/types/database";

interface ExameFormProps {
  exame?: Exame | null;
  onFinish?: () => void;
}

export const ExameForm = ({ exame, onFinish }: ExameFormProps) => {
  const [colaboradorId, setColaboradorId] = useState("");
  const [tipoExameId, setTipoExameId] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [validadeDias, setValidadeDias] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: colaboradores } = useColaboradores();
  const { data: tiposExames } = useTiposExames();
  const createExame = useCreateExame();
  const updateExame = useUpdateExame();

  const isEditing = !!exame;

  useEffect(() => {
    if (isEditing && exame) {
      setColaboradorId(exame.colaborador_id);
      setTipoExameId(exame.tipo_exame_id);
      setDataRealizacao(new Date(exame.data_realizacao).toISOString().split('T')[0]);
      setDataVencimento(new Date(exame.data_vencimento).toISOString().split('T')[0]);
      setValidadeDias(String(exame.validade_dias || ""));
      setObservacoes(exame.observacoes || "");
    }
  }, [exame, isEditing]);

  useEffect(() => {
    if (dataRealizacao && validadeDias) {
      const dataReal = new Date(dataRealizacao);
      dataReal.setDate(dataReal.getDate() + parseInt(validadeDias, 10) + 1);
      setDataVencimento(dataReal.toISOString().split('T')[0]);
    }
  }, [dataRealizacao, validadeDias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorId || !tipoExameId || !dataRealizacao || !dataVencimento || !validadeDias) return;

    const values = {
      colaborador_id: colaboradorId,
      tipo_exame_id: tipoExameId,
      data_realizacao: dataRealizacao,
      data_vencimento: dataVencimento,
      validade_dias: parseInt(validadeDias, 10),
      observacoes: observacoes || undefined,
    };

    if (isEditing) {
      updateExame.mutate({ id: exame.id, ...values }, {
        onSuccess: () => onFinish?.()
      });
    } else {
      createExame.mutate(values, {
        onSuccess: () => {
          setColaboradorId("");
          setTipoExameId("");
          setDataRealizacao("");
          setDataVencimento("");
          setObservacoes("");
          setValidadeDias("");
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar" : "Registrar"} Exame</CardTitle>
        <CardDescription>
          {isEditing ? "Altere as informações do exame." : "Registre um novo exame para um colaborador."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="colaborador">Colaborador *</Label>
              <Select value={colaboradorId} onValueChange={setColaboradorId}>
                <SelectTrigger><SelectValue placeholder="Selecione um colaborador" /></SelectTrigger>
                <SelectContent>{colaboradores?.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoExame">Tipo de Exame *</Label>
              <Select value={tipoExameId} onValueChange={setTipoExameId}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo de exame" /></SelectTrigger>
                <SelectContent>{tiposExames?.map((t) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRealizacao">Data de Realização *</Label>
              <Input id="dataRealizacao" type="date" value={dataRealizacao} onChange={(e) => setDataRealizacao(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validadeDias">Validade (dias) *</Label>
              <Input id="validadeDias" type="number" placeholder="Ex: 365" value={validadeDias} onChange={(e) => setValidadeDias(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
              <Input id="dataVencimento" type="date" value={dataVencimento} readOnly className="bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" placeholder="Observações sobre o exame..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
          </div>
          <Button type="submit" className="w-full" disabled={createExame.isPending || updateExame.isPending}>
            {isEditing ? (updateExame.isPending ? "Salvando..." : "Salvar Alterações") : (createExame.isPending ? "Registrando..." : "Registrar Exame")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};