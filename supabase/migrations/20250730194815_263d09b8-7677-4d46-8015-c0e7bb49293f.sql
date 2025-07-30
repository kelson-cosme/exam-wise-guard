-- Corrigir problemas de segurança: definir search_path para as funções

-- Recriar função para atualizar updated_at com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar função para atualizar status dos exames com search_path seguro
CREATE OR REPLACE FUNCTION public.update_exam_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Atualizar status baseado na data de vencimento
  IF NEW.data_vencimento < CURRENT_DATE THEN
    NEW.status = 'vencido';
  ELSIF NEW.data_vencimento <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status = 'próximo_vencimento';
  ELSE
    NEW.status = 'válido';
  END IF;
  
  RETURN NEW;
END;
$$;