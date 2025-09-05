import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);
const contactEmail = process.env.CONTACT_EMAIL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, userEmail, userName } = body;
    
    console.log('API de Contato Recebeu:', { message, userEmail, userName });

    if (!contactEmail) {
      throw new Error('O e-mail de destino não está configurado.');
    }

    if (!message || !userEmail || !userName) {
        return NextResponse.json({ error: 'Faltam dados no formulário.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: `Contato App CA <contato@coms.filipecarvalho.com.br>`,
      to: [contactEmail],
      cc: [userEmail], // AQUI ESTÁ A MUDANÇA: Adicionamos o e-mail do utilizador em cópia.
      subject: `Nova Mensagem do App CA de ${userName}`,
      reply_to: userEmail,
      html: `
        <p>Você recebeu uma nova mensagem de <strong>${userName}</strong> (${userEmail}):</p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em;">
          <p>${message}</p>
        </blockquote>
        <hr>
        <p><small>Este é um e-mail automático. Para responder, utilize a função "Responder a" do seu cliente de e-mail.</small></p>
      `,
    });

    if (error) {
      console.error("Erro ao enviar e-mail com Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'E-mail enviado com sucesso!', data });

  } catch (error: any) {
    console.error("Erro interno na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

