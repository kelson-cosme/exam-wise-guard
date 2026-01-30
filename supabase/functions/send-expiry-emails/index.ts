import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from "npm:nodemailer@6.9.13";

// Usamos a chave de SERVIÇO para que a função possa ler os dados de todas as empresas
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const SMTP_HOST = 'mail.altmaindustrial.com.br';
const SMTP_PORT = 465;
const SMTP_USER = 'ti@altmaindustrial.com.br';

// Função auxiliar para formatar o nome do exame, especialmente para certificados com procedimentos
const formatarNomeExame = (exame: any) => {
  const tipoNome = exame.tipos_exames?.nome;
  if (tipoNome === 'Certificado' && exame.procedimentos && exame.procedimentos.length > 0) {
    const nomesProcedimentos = exame.procedimentos.map((p: any) => p.nome).join(', ');
    return `Certificado (${nomesProcedimentos})`;
  }
  return tipoNome || 'N/A';
};

serve(async (_req) => {
  try {
    // 1. Buscar TODOS os exames, pois a lógica de "ativo" vs "histórico" será feita aqui
    const { data: todosOsExames, error: examesError } = await supabaseAdmin
      .from('exames')
      .select(`*, empresas (nome), colaboradores (nome), tipos_exames (nome, dias_alerta), procedimentos (id, nome)`) // Seleciona ID dos procedimentos
      .order('data_vencimento', { ascending: false }); // Ordena para facilitar a busca do mais recente

    if (examesError) throw examesError;
    if (!todosOsExames || todosOsExames.length === 0) {
      console.log("Nenhum exame encontrado.");
      return new Response(JSON.stringify({ message: "Nenhum exame para notificar." }));
    }

    // 2. Lógica para identificar apenas os exames ATIVOS (os mais recentes de cada tipo)
    const maisRecentesMap = new Map<string, any>();
    todosOsExames.forEach(exame => {
      let uniqueKey = `${exame.colaborador_id}-${exame.tipo_exame_id}`;

      if (exame.tipos_exames?.nome === 'Certificado' && exame.procedimentos && exame.procedimentos.length > 0) {
        const procedureKey = exame.procedimentos.map((p: any) => p.id).sort().join('-');
        uniqueKey = `${exame.colaborador_id}-${exame.tipo_exame_id}-${procedureKey}`;
      }

      // Como já ordenamos pela data de vencimento decrescente, o primeiro que encontrarmos é o mais recente.
      if (!maisRecentesMap.has(uniqueKey)) {
        maisRecentesMap.set(uniqueKey, exame);
      }
    });
    const examesAtivos = Array.from(maisRecentesMap.values());

    // 3. Filtrar os exames ativos que precisam de atenção (Cálculo Dinâmico)
    const examesParaNotificar = examesAtivos.filter(exame => {
      const dataVencimento = new Date(exame.data_vencimento);
      const hoje = new Date();
      // Zera as horas para comparar apenas as datas
      hoje.setHours(0, 0, 0, 0);
      const vencimento = new Date(dataVencimento);
      vencimento.setHours(0, 0, 0, 0);

      const diffTime = vencimento.getTime() - hoje.getTime();
      const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const diasAlerta = exame.tipos_exames?.dias_alerta || 30; // Default para 30 dias se não definido

      // Verifica se está vencido ou próximo do vencimento
      return diasParaVencer < 0 || diasParaVencer <= diasAlerta;
    });

    if (examesParaNotificar.length === 0) {
      console.log("Nenhum exame ativo para notificar.");
      return new Response(JSON.stringify({ message: "Nenhum exame ativo para notificar." }));
    }

    // 4. Agrupar os exames a serem notificados por empresa
    const examesPorEmpresa: { [key: string]: any[] } = examesParaNotificar.reduce((acc, exame) => {
      const empresaId = exame.empresa_id;
      if (!acc[empresaId]) acc[empresaId] = [];
      acc[empresaId].push(exame);
      return acc;
    }, {});

    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    if (!smtpPassword) throw new Error("A variável SMTP_PASSWORD não está configurada.");

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: SMTP_PORT, secure: true, auth: { user: SMTP_USER, pass: smtpPassword },
    });

    // 5. Para cada empresa, buscar destinatários e enviar o e-mail
    for (const empresaId in examesPorEmpresa) {
      const examesDaEmpresa = examesPorEmpresa[empresaId];
      const nomeEmpresa = examesDaEmpresa[0].empresas.nome;

      const { data: destinatarios, error: destError } = await supabaseAdmin
        .from('notificacao_destinatarios')
        .select('email')
        .eq('empresa_id', empresaId);

      if (destError) {
        console.error(`Erro ao buscar destinatários para a empresa ${nomeEmpresa}:`, destError);
        continue;
      }

      if (!destinatarios || destinatarios.length === 0) {
        console.log(`Nenhum destinatário configurado para a empresa ${nomeEmpresa}.`);
        continue;
      }

      const recipientList = destinatarios.map(d => d.email);

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
          <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em;">Exam Wise Guard</h1>
              <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Relatório de Vencimentos - ${nomeEmpresa}</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Olá,
              </p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                Identificamos que os seguintes exames ou certificados requerem sua atenção imediata:
              </p>

              <div style="margin-top: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f8fafc;">
                      <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Colaborador</th>
                      <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Exame / Certificado</th>
                      <th style="padding: 12px 16px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Vencimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${examesDaEmpresa.map((exame, index) => {
        const dataVencimento = new Date(exame.data_vencimento);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const vencimento = new Date(dataVencimento);
        vencimento.setHours(0, 0, 0, 0);
        const isVencido = vencimento.getTime() < hoje.getTime();

        // Estilo Zebra
        const bgStyle = index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8fafc;';
        // Cor do status
        const statusColor = isVencido ? '#ef4444' : '#eab308'; // Red-500 ou Yellow-500
        const statusText = isVencido ? 'Vencido' : 'A vencer';
        const statusBg = isVencido ? 'background-color: #fef2f2;' : 'background-color: #fefce8;';

        return `
                        <tr style="${bgStyle}">
                          <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 500;">
                            ${exame.colaboradores?.nome || 'N/A'}
                          </td>
                          <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 14px;">
                            ${formatarNomeExame(exame)}
                          </td>
                          <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                            <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; ${statusBg} color: ${statusColor}; font-size: 12px; font-weight: 600; border: 1px solid ${statusColor}30;">
                              ${dataVencimento.toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                        </tr>
                      `;
      }).join('')}
                  </tbody>
                </table>
              </div>
              
              <div style="margin-top: 32px; text-align: center;">
                 <a href="https://exam-wise-guard.vercel.app/" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">Acessar Painel</a>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Exam Wise Guard. Este é um e-mail automático, por favor não responda.
              </p>
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `Alertas - Exam Wise Guard <${SMTP_USER}>`,
        to: recipientList.join(', '),
        subject: `Alerta de Vencimentos - ${nomeEmpresa}`,
        html: emailHtml,
      });

      console.log(`E-mail de alerta enviado com sucesso para ${recipientList.length} destinatário(s) da empresa ${nomeEmpresa}.`);
    }

    return new Response(JSON.stringify({ message: "Processo de notificação concluído." }), { status: 200 });

  } catch (error) {
    console.error('Erro na função de notificação:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});