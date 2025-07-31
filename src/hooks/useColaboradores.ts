import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Colaborador } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export const useColaboradores = () => {
  return useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar colaboradores",
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Colaborador[];
    },
  });
};

export const useCreateColaborador = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (colaborador: Omit<Colaborador, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('colaboradores')
        .insert([colaborador])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast({
        title: "Sucesso",
        description: "Colaborador cadastrado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar colaborador",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateColaborador = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Colaborador> & { id: string }) => {
      const { data, error } = await supabase
        .from('colaboradores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast({
        title: "Sucesso",
        description: "Colaborador atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar colaborador",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteColaborador = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast({
        title: "Sucesso",
        description: "Colaborador excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir colaborador: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};