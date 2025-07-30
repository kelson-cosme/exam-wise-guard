-- Criar tabela de colaboradores
CREATE TABLE public.colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_admissao DATE NOT NULL,
  cargo TEXT,
  setor TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tipos de exames
CREATE TABLE public.tipos_exames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  validade_meses INTEGER NOT NULL DEFAULT 12,
  dias_alerta INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de exames
CREATE TABLE public.exames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo_exame_id UUID NOT NULL REFERENCES public.tipos_exames(id),
  data_realizacao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'válido' CHECK (status IN ('válido', 'vencido', 'próximo_vencimento')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso total (sistema interno)
CREATE POLICY "Permitir acesso total a colaboradores" 
ON public.colaboradores 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir acesso total a tipos_exames" 
ON public.tipos_exames 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir acesso total a exames" 
ON public.exames 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at
CREATE TRIGGER update_colaboradores_updated_at
  BEFORE UPDATE ON public.colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exames_updated_at
  BEFORE UPDATE ON public.exames
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para atualizar status dos exames automaticamente
CREATE OR REPLACE FUNCTION public.update_exam_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar status automaticamente
CREATE TRIGGER update_exam_status_trigger
  BEFORE INSERT OR UPDATE OF data_vencimento ON public.exames
  FOR EACH ROW
  EXECUTE FUNCTION public.update_exam_status();

-- Inserir alguns tipos de exames padrão
INSERT INTO public.tipos_exames (nome, descricao, validade_meses, dias_alerta) VALUES
('Exame Médico Ocupacional', 'Exame médico obrigatório para colaboradores', 12, 30),
('Treinamento de Segurança', 'Treinamento básico de segurança do trabalho', 12, 45),
('Curso de Primeiros Socorros', 'Capacitação em primeiros socorros', 24, 60),
('Exame Audiométrico', 'Exame de audição ocupacional', 6, 15),
('Exame Oftalmológico', 'Exame de visão ocupacional', 12, 30);