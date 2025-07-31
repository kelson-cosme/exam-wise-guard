import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateProcedimento } from "@/hooks/useProcedimentos";

export const ProcedimentoForm = () => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const createProcedimento = useCreateProcedimento();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;
    createProcedimento.mutate({ nome, descricao }, {
      onSuccess: () => {
        setNome("");
        setDescricao("");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Procedimento</CardTitle>
        <CardDescription>Adicione um novo procedimento que pode ser vinculado a um exame.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Procedimento *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <Button type="submit" disabled={createProcedimento.isPending}>
            {createProcedimento.isPending ? "Salvando..." : "Salvar Procedimento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};