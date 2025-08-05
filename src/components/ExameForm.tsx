import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useCreateExame, useUpdateExame, useTiposExames } from "@/hooks/useExames";
import { useColaboradores } from "@/hooks/useColaboradores";
import { useProcedimentos } from "@/hooks/useProcedimentos";
import { Exame } from "@/types/database";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";


interface ExameFormProps {
  exame?: Exame | null;
  onFinish?: () => void;
  isRenewal?: boolean;
}

export const ExameForm = ({ exame, onFinish, isRenewal = false }: ExameFormProps) => {
  const [colaboradorId, setColaboradorId] = useState("");
  const [tipoExameId, setTipoExameId] = useState("");
  const [natureza, setNatureza] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [validadeDias, setValidadeDias] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [valor, setValor] = useState("");
  const [selectedProcedimentos, setSelectedProcedimentos] = useState<string[]>([]);
  const [openPopover, setOpenPopover] = useState(false);

  const { data: colaboradores } = useColaboradores();
  const { data: tiposExames } = useTiposExames();
  const { data: procedimentos } = useProcedimentos();
  const { data: profile } = useProfile();
  const createExame = useCreateExame();
  const updateExame = useUpdateExame();

  const isEditing = !!exame && !isRenewal;

  const naturezasExame = ["Admissional", "Demissional", "Retorno ao Trabalho", "Mudança de Risco/Cargo", "Periódico", "Certificado"];

  useEffect(() => {
    if (exame) {
      setColaboradorId(exame.colaborador_id);
      setTipoExameId(exame.tipo_exame_id);
      setNatureza(exame.natureza || "");
      if (isEditing) {
        setDataRealizacao(new Date(exame.data_realizacao).toISOString().split('T')[0]);
        setDataVencimento(new Date(exame.data_vencimento).toISOString().split('T')[0]);
        setValidadeDias(String(exame.validade_dias || ""));
        setObservacoes(exame.observacoes || "");
        setValor(String(exame.valor || ""));
        setSelectedProcedimentos(exame.procedimentos?.map(p => p.id) || []);
      } else {
        setDataRealizacao("");
        setDataVencimento("");
        setValidadeDias("");
        setObservacoes("");
        setValor("");
        setSelectedProcedimentos([]);
      }
    }
  }, [exame, isEditing, isRenewal]);

  useEffect(() => {
    if (dataRealizacao && validadeDias) {
      const dataReal = new Date(`${dataRealizacao}T00:00:00`);
      dataReal.setDate(dataReal.getDate() + parseInt(validadeDias, 10));
      setDataVencimento(dataReal.toISOString().split('T')[0]);
    } else {
      setDataVencimento("");
    }
  }, [dataRealizacao, validadeDias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorId || !tipoExameId || !natureza || !dataRealizacao || !dataVencimento || !validadeDias || !profile?.empresa_id) {
      console.error("Perfil do usuário ou ID da empresa não encontrado!");
      return;
    };

    const values = {
      colaborador_id: colaboradorId,
      tipo_exame_id: tipoExameId,
      natureza: natureza,
      empresa_id: profile.empresa_id,
      data_realizacao: dataRealizacao,
      data_vencimento: dataVencimento,
      validade_dias: parseInt(validadeDias, 10),
      valor: valor ? parseFloat(valor) : undefined,
      observacoes: observacoes || undefined,
      procedimento_ids: selectedProcedimentos,
    };
    if (isEditing) {
      const { procedimento_ids, ...updateValues } = values;
      updateExame.mutate({ id: exame.id, ...updateValues }, { onSuccess: () => onFinish?.() });
    } else {
      createExame.mutate(values, {
        onSuccess: () => {
          onFinish?.();
          if (!isRenewal) {
            setColaboradorId(""); setTipoExameId(""); setNatureza("");
            setDataRealizacao(""); setValidadeDias(""); setObservacoes("");
            setValor(""); setSelectedProcedimentos([]);
          }
        }
      });
    }
  };
  
  const getTitle = () => {
    if (isEditing) return "Editar Exame";
    if (isRenewal) return "Renovar Exame";
    return "Registrar Exame";
  };

  const selectedProcedimentosDetails = useMemo(() => {
    return procedimentos?.filter(p => selectedProcedimentos.includes(p.id)) || [];
  }, [selectedProcedimentos, procedimentos]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{isEditing ? "Altere as informações do exame." : isRenewal ? "Preencha os dados do novo exame." : "Registre um novo exame."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2"><Label htmlFor="colaborador">Colaborador *</Label><Select value={colaboradorId} onValueChange={setColaboradorId} disabled={isEditing || isRenewal}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{colaboradores?.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="tipoExame">Tipo de Exame *</Label><Select value={tipoExameId} onValueChange={setTipoExameId} disabled={isEditing || isRenewal}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{tiposExames?.map((t) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="natureza">Natureza do Exame *</Label><Select value={natureza} onValueChange={setNatureza}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{naturezasExame.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="dataRealizacao">{isRenewal ? "Nova " : ""}Data de Realização *</Label><Input id="dataRealizacao" type="date" value={dataRealizacao} onChange={(e) => setDataRealizacao(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="validadeDias">Validade (dias) *</Label><Input id="validadeDias" type="number" placeholder="Ex: 365" value={validadeDias} onChange={(e) => setValidadeDias(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="dataVencimento">{isRenewal ? "Nova " : ""}Data de Vencimento</Label><Input id="dataVencimento" type="date" value={dataVencimento} readOnly className="bg-muted" /></div>
            <div className="space-y-2"><Label htmlFor="valor">Valor do Exame (R$)</Label><Input id="valor" type="number" placeholder="Ex: 150.00" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
          </div>
          
          <div className="space-y-2">
            <Label>Procedimentos Realizados</Label>
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPopover} className="w-full justify-between h-auto min-h-10">
                  <div className="flex gap-1 flex-wrap">
                    {selectedProcedimentosDetails.length > 0 ? (
                      selectedProcedimentosDetails.map(proc => (
                        <Badge variant="secondary" key={proc.id} className="mr-1">
                          {proc.nome}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground font-normal">Selecione os procedimentos...</span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar procedimento..." />
                  <CommandList className="max-h-56">
                    <CommandEmpty>Nenhum procedimento encontrado.</CommandEmpty>
                    <CommandGroup>
                      {procedimentos?.map((proc) => (
                        <CommandItem
                          key={proc.id}
                          value={proc.nome}
                          onSelect={() => {
                            const isSelected = selectedProcedimentos.includes(proc.id);
                            if (isSelected) {
                              setSelectedProcedimentos(selectedProcedimentos.filter(id => id !== proc.id));
                            } else {
                              setSelectedProcedimentos([...selectedProcedimentos, proc.id]);
                            }
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedProcedimentos.includes(proc.id) ? "opacity-100" : "opacity-0")} />
                          {proc.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" placeholder="Observações sobre o novo exame..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
          </div>
          <Button type="submit" className="w-full" disabled={createExame.isPending || updateExame.isPending}>
            {isEditing ? (updateExame.isPending ? "Salvando..." : "Salvar Alterações") : (createExame.isPending ? "Registrando..." : "Registrar Exame")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};