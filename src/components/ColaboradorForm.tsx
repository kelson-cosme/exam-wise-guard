import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateColaborador, useUpdateColaborador } from "@/hooks/useColaboradores";
import { Colaborador } from "@/types/database";

interface ColaboradorFormProps {
  colaborador?: Colaborador | null;
  onFinish?: () => void;
}

export const ColaboradorForm = ({ colaborador, onFinish }: ColaboradorFormProps) => {
  const [nome, setNome] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");

  const createColaborador = useCreateColaborador();
  const updateColaborador = useUpdateColaborador();

  const isEditing = !!colaborador;

  useEffect(() => {
    if (isEditing && colaborador) {
      setNome(colaborador.nome);
      setDataAdmissao(colaborador.data_admissao);
      setCargo(colaborador.cargo || "");
      setSetor(colaborador.setor || "");
    }
  }, [colaborador, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !dataAdmissao) return;

    const values = {
      nome,
      data_admissao: dataAdmissao,
      cargo: cargo || undefined,
      setor: setor || undefined,
      ativo: true,
    };

    if (isEditing) {
      updateColaborador.mutate({ id: colaborador.id, ...values }, {
        onSuccess: () => onFinish?.()
      });
    } else {
      createColaborador.mutate(values, {
        onSuccess: () => {
          setNome("");
          setDataAdmissao("");
          setCargo("");
          setSetor("");
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar" : "Cadastrar"} Colaborador</CardTitle>
        <CardDescription>
          {isEditing ? "Altere as informações do colaborador." : "Adicione um novo colaborador ao sistema."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
              <Input
                id="dataAdmissao"
                type="date"
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                type="text"
                placeholder="Cargo do colaborador"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Input
                id="setor"
                type="text"
                placeholder="Setor de trabalho"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={createColaborador.isPending || updateColaborador.isPending}
          >
            {isEditing 
              ? (updateColaborador.isPending ? "Salvando..." : "Salvar Alterações")
              : (createColaborador.isPending ? "Cadastrando..." : "Cadastrar Colaborador")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};