import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exame, ExameComDetalhes, TipoExame } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export const useExames = () => {
  return useQuery({
    queryKey: ['exames'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exames')
        .select(`
          *,
          colaboradores (nome),
          tipos_exames (nome)
        `)
        .order('data_vencimento');
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar exames",
          variant: "destructive",
        });
        throw error;
      }
      
      const examesComDetalhes: ExameComDetalhes[] = data.map(exame => {
        const dataVencimento = new Date(exame.data_vencimento);
        const hoje = new Date();
        const diffTime = dataVencimento.getTime() - hoje.getTime();
        const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          id: exame.id,
          colaborador_id: exame.colaborador_id,
          tipo_exame_id: exame.tipo_exame_id,
          data_realizacao: exame.data_realizacao,
          data_vencimento: exame.data_vencimento,
          observacoes: exame.observacoes,
          status: exame.status as 'válido' | 'vencido' | 'próximo_vencimento',
          created_at: exame.created_at,
          updated_at: exame.updated_at,
          colaborador_nome: exame.colaboradores?.nome || '',
          tipo_exame_nome: exame.tipos_exames?.nome || '',
          dias_para_vencer: diasParaVencer,
        };
      });
      
      return examesComDetalhes;
    },
  });
};

export const useExamesProximosVencimento = () => {
  return useQuery({
    queryKey: ['exames-proximos-vencimento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exames')
        .select(`
          *,
          colaboradores (nome),
          tipos_exames (nome, dias_alerta)
        `)
        .in('status', ['próximo_vencimento', 'vencido'])
        .order('data_vencimento');
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar exames próximos ao vencimento",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });
};

export const useCreateExame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exame: Omit<Exame, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data, error } = await supabase
        .from('exames')
        .insert([exame])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      queryClient.invalidateQueries({ queryKey: ['exames-proximos-vencimento'] });
      toast({
        title: "Sucesso",
        description: "Exame cadastrado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar exame",
        variant: "destructive",
      });
    },
  });
};

export const useTiposExames = () => {
  return useQuery({
    queryKey: ['tipos-exames'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_exames')
        .select('*')
        .order('nome');
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar tipos de exames",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });
};

// ADICIONE ESTA NOVA FUNÇÃO
export const useCreateTipoExame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tipoExame: Omit<TipoExame, 'id' | 'created_at' | 'validade_dias'>) => {
      // @ts-ignore
      const { data, error } = await supabase
        .from('tipos_exames')
        .insert([tipoExame])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-exames'] });
      toast({
        title: "Sucesso",
        description: "Tipo de exame cadastrado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao cadastrar tipo de exame: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};