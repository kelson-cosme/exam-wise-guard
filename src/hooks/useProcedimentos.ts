import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Defina o tipo para Procedimento se ainda não o tiver
export interface Procedimento {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
}

export const useProcedimentos = () => {
  return useQuery({
    queryKey: ['procedimentos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('procedimentos').select('*').order('nome');
      if (error) throw error;
      return data as Procedimento[];
    },
  });
};

export const useCreateProcedimento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (procedimento: Omit<Procedimento, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('procedimentos').insert([procedimento]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] });
      toast({ title: "Sucesso", description: "Procedimento cadastrado com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao cadastrar procedimento: ${error.message}`, variant: "destructive" }),
  });
};

export const useDeleteProcedimento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('procedimentos').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] });
      toast({ title: "Sucesso", description: "Procedimento excluído com sucesso!" });
    },
    onError: (error) => toast({ title: "Erro", description: `Erro ao excluir procedimento: ${error.message}`, variant: "destructive" }),
  });
};