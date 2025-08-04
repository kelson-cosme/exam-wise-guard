import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from "npm:nodemailer@6.9.13";

// Configurações
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SMTP_HOST = 'mail.altmaindustrial.com.br';
const SMTP_PORT = 465;
const SMTP_USER = 'ti@altmaindustrial.com.br';

const EMAIL_RECIPIENT = [
  //'adm@altmaindustrial.com.br',
  'kelson.almeida123@gmail.com',
  'ti@altmaindustrial.com.br'
];

// Função para formatar o nome do exame/certificado
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
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    if (!smtpPassword) {
      throw new Error("A variável de ambiente SMTP_PASSWORD não está configurada.");
    }

    // 1. Buscar exames e seus procedimentos relacionados
    const { data: exames, error } = await supabase
      .from('exames')
      .select(`
        data_vencimento,
        colaboradores (nome),
        tipos_exames (nome),
        procedimentos (nome)
      `)
      .in('status', ['vencido', 'próximo_vencimento'])
      .order('data_vencimento');

    if (error) throw new Error(`Erro ao buscar exames: ${error.message}`);

    if (!exames || exames.length === 0) {
      console.log("Nenhum exame para notificar.");
      return new Response(JSON.stringify({ message: "Nenhum exame para notificar." }), {
        headers: { 'Content-Type': 'application/json' }, status: 200,
      });
    }

    // 2. Montar o corpo do e-mail
    const emailHtml = `
      <h1>Alerta de Vencimento de Exames</h1>
      <p>Olá,</p>
      <p>Os seguintes exames estão vencidos ou próximos do vencimento:</p>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>Colaborador</th>
            <th>Tipo de Exame</th>
            <th>Data de Vencimento</th>
          </tr>
        </thead>
        <tbody>
          ${exames.map(exame => `
            <tr>
              <td>${exame.colaboradores?.nome || 'N/A'}</td>
              <td>${formatarNomeExame(exame)}</td>
              <td>${new Date(exame.data_vencimento).toLocaleDateString('pt-BR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p>Por favor, tome as ações necessárias.</p>
    `;

    // 3. Configurar o transportador do Nodemailer
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: smtpPassword,
      },
    });

    // 4. Enviar o e-mail
    await transporter.sendMail({
      from: `Exames Altma Industrial <${SMTP_USER}>`,
      to: EMAIL_RECIPIENT.join(', '),
      subject: "Alerta: Exames Vencendo",
      html: emailHtml,
    });

    console.log("E-mail de alerta enviado com sucesso!");
    return new Response(JSON.stringify({ message: `E-mail enviado para ${EMAIL_RECIPIENT.join(', ')}` }), {
      headers: { 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (error) {
    console.error('Erro detalhado na função:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' }, status: 500,
    });
  }
});