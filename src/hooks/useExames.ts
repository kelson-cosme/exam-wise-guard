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
          tipos_exames (*) 
        `)
        .order('data_vencimento');
      
      if (error) {
        toast({ title: "Erro", description: "Erro ao carregar exames", variant: "destructive" });
        throw error;
      }
      
      const examesComDetalhes: ExameComDetalhes[] = data.map(exame => {
        const dataVencimento = new Date(exame.data_vencimento);
        const hoje = new Date();
        const diffTime = dataVencimento.getTime() - hoje.getTime();
        const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return { 
          ...exame,
          status: exame.status as 'válido' | 'vencido' | 'próximo_vencimento',
          colaborador_nome: exame.colaboradores?.nome || '',
          tipo_exame_nome: exame.tipos_exames?.nome || '',
          dias_para_vencer: diasParaVencer,
        };
      });
      
      return examesComDetalhes;
    },
  });
};

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
    mutationFn: async (exame: Omit<Exame, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data, error } = await supabase.from('exames').insert([exame]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      queryClient.invalidateQueries({ queryKey: ['exames-proximos-vencimento'] });
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