
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateTipoExame, useUpdateTipoExame } from "@/hooks/useExames";
import { TipoExame } from "@/types/database";

interface TipoExameFormProps {
  tipoExame?: TipoExame | null;
  onFinish?: () => void; // Para fechar o dialog após a edição
}

export const TipoExameForm = ({ tipoExame, onFinish }: TipoExameFormProps) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [diasAlerta, setDiasAlerta] = useState("");

  const createTipoExame = useCreateTipoExame();
  const updateTipoExame = useUpdateTipoExame();

  const isEditing = !!tipoExame;

  useEffect(() => {
    if (isEditing) {
      setNome(tipoExame.nome);
      setDescricao(tipoExame.descricao || "");
      setDiasAlerta(String(tipoExame.dias_alerta));
    }
  }, [tipoExame, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !diasAlerta) return;

    const values = {
      nome,
      descricao: descricao || undefined,
      dias_alerta: parseInt(diasAlerta, 10),
    };

    if (isEditing) {
      updateTipoExame.mutate({ id: tipoExame.id, ...values }, {
        onSuccess: () => {
          onFinish?.();
        }
      });
    } else {
      createTipoExame.mutate(values, {
        onSuccess: () => {
          setNome("");
          setDescricao("");
          setDiasAlerta("");
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar" : "Cadastrar"} Tipo de Exame</CardTitle>
        <CardDescription>
          {isEditing ? "Altere as informações do tipo de exame." : "Adicione um novo tipo de exame ao sistema."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Exame *</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Ex: Exame Demissional"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diasAlerta">Alerta de Vencimento (dias) *</Label>
            <Input
              id="diasAlerta"
              type="number"
              placeholder="Ex: 30"
              value={diasAlerta}
              onChange={(e) => setDiasAlerta(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva brevemente o tipo de exame..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createTipoExame.isPending || updateTipoExame.isPending}
          >
            {isEditing 
              ? (updateTipoExame.isPending ? "Salvando..." : "Salvar Alterações")
              : (createTipoExame.isPending ? "Cadastrando..." : "Cadastrar Tipo de Exame")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};