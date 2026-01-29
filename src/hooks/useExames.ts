import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exame, ExameComDetalhes, TipoExame } from '@/types/database';
import { toast } from '@/hooks/use-toast';

// --- HOOKS PARA EXAMES ---

export const useExames = () => {
  return useQuery({
    queryKey: ['exames'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exames')
        .select(`
          *,
          colaboradores (*),
          tipos_exames (*),
          procedimentos (*)
        `)
        .order('data_vencimento');
      
      if (error) throw error;
      
    const examesComDetalhes: ExameComDetalhes[] = data.map(exame => {
        const dataVencimento = new Date(exame.data_vencimento);
        const hoje = new Date();
        // Zera as horas para comparar apenas as datas
        hoje.setHours(0, 0, 0, 0);
        const vencimento = new Date(dataVencimento);
        vencimento.setHours(0, 0, 0, 0);

        const diffTime = vencimento.getTime() - hoje.getTime();
        const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const diasAlerta = exame.tipos_exames?.dias_alerta || 30; // Default para 30 dias se não definido
        
        let status: 'válido' | 'vencido' | 'próximo_vencimento' = 'válido';
        
        if (diasParaVencer < 0) {
          status = 'vencido';
        } else if (diasParaVencer <= diasAlerta) {
          status = 'próximo_vencimento';
        }
        
        return { 
          ...exame,
          status: status,
          colaborador_nome: exame.colaboradores?.nome || '',
          tipo_exame_nome: exame.tipos_exames?.nome || '',
          dias_para_vencer: diasParaVencer,
        };
      });
      
      return examesComDetalhes;
    },
  });
};

// Interface para o formulário
interface ExameFormData extends Omit<Exame, 'id' | 'created_at' | 'updated_at' | 'status'> {
  procedimento_ids?: string[];
}

// ... (o restante do arquivo permanece exatamente igual)

export const useExamesProximosVencimento = () => {
  return useQuery({
    queryKey: ['exames-proximos-vencimento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exames')
        .select(`*, colaboradores (nome), tipos_exames (nome, dias_alerta)`)
        .in('status', ['próximo_vencimento', 'vencido'])
        .order('data_vencimento');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateExame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ procedimento_ids, ...exameData }: ExameFormData) => {
      // 1. Insere o exame e obtém o ID
      const { data: newExame, error: exameError } = await supabase
        .from('exames')
        .insert(exameData)
        .select()
        .single();

      if (exameError) throw exameError;

      // 2. Se houver procedimentos selecionados, insere na tabela de ligação
      if (procedimento_ids && procedimento_ids.length > 0) {
        const links = procedimento_ids.map(procId => ({
          exame_id: newExame.id,
          procedimento_id: procId,
        }));
        const { error: linkError } = await supabase.from('exames_procedimentos').insert(links);
        if (linkError) throw linkError;
      }
      return newExame;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      toast({ title: "Sucesso", description: "Exame cadastrado com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao cadastrar exame: ${error.message}`, variant: "destructive" }),
  });
};

export const useUpdateExame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exame> & { id: string }) => {
      const { data, error } = await supabase.from('exames').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      queryClient.invalidateQueries({ queryKey: ['exames-proximos-vencimento'] });
      toast({ title: "Sucesso", description: "Exame atualizado com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao atualizar exame: ${error.message}`, variant: "destructive" }),
  });
};

export const useDeleteExame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('exames').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      queryClient.invalidateQueries({ queryKey: ['exames-proximos-vencimento'] });
      toast({ title: "Sucesso", description: "Exame excluído com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao excluir exame: ${error.message}`, variant: "destructive" }),
  });
};

// --- HOOKS PARA TIPOS DE EXAME ---

export const useTiposExames = () => {
  return useQuery({
    queryKey: ['tipos-exames'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tipos_exames').select('*').order('nome');
      if (error) {
        toast({ title: "Erro", description: "Erro ao carregar tipos de exames", variant: "destructive" });
        throw error;
      }
      return data;
    },
  });
};

export const useCreateTipoExame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tipoExame: Omit<TipoExame, 'id' | 'created_at' | 'validade_dias'>) => {
      // @ts-ignore
      const { data, error } = await supabase.from('tipos_exames').insert([tipoExame]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-exames'] });
      toast({ title: "Sucesso", description: "Tipo de exame cadastrado com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao cadastrar tipo de exame: ${error.message}`, variant: "destructive" }),
  });
};

export const useUpdateTipoExame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TipoExame> & { id: string }) => {
      const { data, error } = await supabase.from('tipos_exames').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-exames'] });
      toast({ title: "Sucesso", description: "Tipo de exame atualizado com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao atualizar tipo de exame: ${error.message}`, variant: "destructive" }),
  });
};

export const useDeleteTipoExame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('tipos_exames').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-exames'] });
      toast({ title: "Sucesso", description: "Tipo de exame excluído com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao excluir tipo de exame: ${error.message}`, variant: "destructive" }),
  });
};