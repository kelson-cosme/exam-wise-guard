import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from './useProfile';

export const useDestinatarios = () => {
  const { data: profile } = useProfile();
  const empresaId = profile?.empresa_id;

  return useQuery({
    queryKey: ['destinatarios', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from('notificacao_destinatarios')
        .select('*')
        .eq('empresa_id', empresaId);
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
};

export const useAddDestinatario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (newDestinatario: { email: string; empresa_id: string }) => {
      const { data, error } = await supabase.from('notificacao_destinatarios').insert(newDestinatario);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinatarios'] });
      toast({ title: "Sucesso!", description: "Destinatário adicionado." });
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });
};

export const useDeleteDestinatario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('notificacao_destinatarios').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinatarios'] });
      toast({ title: "Sucesso!", description: "Destinatário removido." });
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });
};