import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    // A chave da query inclui o ID do usuário para ser única
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('perfis')
        .select('*, empresas (nome)')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // Não joga um erro se o perfil ainda não existe
        if (error.code === 'PGRST116') return null; 
        throw error;
      }
      return data;
    },
    // A query só será executada se houver um usuário logado
    enabled: !!user,
  });
};