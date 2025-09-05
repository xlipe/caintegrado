import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Pega a chave de API do ambiente, garantindo que ela exista.
const resend = new Resend(process.env.RESEND_API_KEY!);
const toEmail = process.env.CONTACT_EMAIL!;

export async function POST(request: Request) {
  try {
    const { from, subject, message } = await request.json();

    if (!from || !subject || !message) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    if (!toEmail) {
        console.error("Variável de ambiente CONTACT_EMAIL não configurada.");
        return NextResponse.json({ error: 'O servidor não está configurado para receber e-mails.' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Contato App CA <onboarding@resend.dev>', // Este é o remetente exigido pelo Resend no plano gratuito.
      to: [toEmail],
      reply_to: from, // O e-mail do usuário vai aqui, para você poder responder.
      subject: `[App CA] - ${subject}`,
      text: `Mensagem de: ${from}\n\n${message}`,
    });

    if (error) {
      console.error("Erro ao enviar e-mail com Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro inesperado na API de contato:", error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
  }
}

