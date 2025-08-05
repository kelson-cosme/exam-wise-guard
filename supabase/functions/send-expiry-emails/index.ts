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
    // 1. Buscar todos os exames que precisam de atenção
    const { data: todosExames, error: examesError } = await supabaseAdmin
      .from('exames')
      .select(`*, empresas (nome), colaboradores (nome), tipos_exames (nome), procedimentos (nome)`)
      .in('status', ['vencido', 'próximo_vencimento']);

    if (examesError) throw examesError;
    if (!todosExames || todosExames.length === 0) {
      console.log("Nenhum exame para notificar em nenhuma empresa.");
      return new Response(JSON.stringify({ message: "Nenhum exame para notificar." }));
    }

    // 2. Agrupar exames por empresa
    const examesPorEmpresa: { [key: string]: any[] } = todosExames.reduce((acc, exame) => {
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

    // 3. Para cada empresa com exames pendentes, buscar destinatários e enviar e-mail
    for (const empresaId in examesPorEmpresa) {
      const examesDaEmpresa = examesPorEmpresa[empresaId];
      const nomeEmpresa = examesDaEmpresa[0].empresas.nome;

      // Buscar os destinatários configurados para esta empresa
      const { data: destinatarios, error: destError } = await supabaseAdmin
        .from('notificacao_destinatarios')
        .select('email')
        .eq('empresa_id', empresaId);

      if (destError) {
        console.error(`Erro ao buscar destinatários para a empresa ${nomeEmpresa}:`, destError);
        continue; // Pula para a próxima empresa
      }

      if (!destinatarios || destinatarios.length === 0) {
        console.log(`Nenhum destinatário configurado para a empresa ${nomeEmpresa}.`);
        continue; // Pula para a próxima empresa
      }

      const recipientList = destinatarios.map(d => d.email);

      // Montar o corpo do e-mail específico para esta empresa
      const emailHtml = `
        <h1>Alerta de Vencimento de Exames - ${nomeEmpresa}</h1>
        <p>Os seguintes exames estão vencidos ou próximos do vencimento:</p>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead><tr style="background-color: #f2f2f2;"><th>Colaborador</th><th>Tipo de Exame</th><th>Data de Vencimento</th></tr></thead>
          <tbody>
            ${examesDaEmpresa.map(exame => `
              <tr>
                <td>${exame.colaboradores?.nome || 'N/A'}</td>
                <td>${formatarNomeExame(exame)}</td>
                <td>${new Date(exame.data_vencimento).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      // Enviar o e-mail
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