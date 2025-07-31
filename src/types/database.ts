export interface Colaborador {
  id: string;
  nome: string;
  data_admissao: string;
  cargo?: string;
  setor?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoExame {
  id: string;
  nome: string;
  descricao?: string;
  dias_alerta: number;
  created_at: string;
}

export interface Exame {
  id: string;
  colaborador_id: string;
  tipo_exame_id: string;
  data_realizacao: string;
  data_vencimento: string;
  validade_dias?: number;
  observacoes?: string;
  valor?: number | null; // ADICIONE ESTA LINHA
  status: 'válido' | 'vencido' | 'próximo_vencimento';
  created_at: string;
  updated_at: string;
  colaboradores?: Colaborador;
  tipos_exames?: TipoExame;
}
export interface ExameComDetalhes extends Exame {
  colaborador_nome: string;
  tipo_exame_nome: string;
  dias_para_vencer: number;
}