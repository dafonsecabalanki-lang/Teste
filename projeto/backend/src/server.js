import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Utilitário de validação simples
function isValidEmail(email) {
  return /.+@.+\..+/.test(email);
}

// Endpoint: receber contato e enviar email
app.post('/api/contatos', async (req, res) => {
  try {
    const { nome, email, mensagem, telefone } = req.body;
    if (!nome || !email || !mensagem || !telefone) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, telefone, mensagem.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = process.env.TO_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPass || !toEmail) {
      return res.status(500).json({ error: 'Servidor sem configuração de email.' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const subject = `Novo contato do site - ${nome}`;
    const text = `Nome: ${nome}\nEmail: ${email}\nTelefone: ${telefone}\n\nMensagem:\n${mensagem}`;

    await transporter.sendMail({
      from: `Site Contato <${smtpUser}>`,
      to: toEmail,
      replyTo: email,
      subject,
      text
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    return res.status(500).json({ error: 'Erro interno ao processar contato.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});


