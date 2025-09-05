const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Nodemailer
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Rota POST /contato
app.post('/contato', async (req, res) => {
  try {
    const { nome, gmail, numero, descricao } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !gmail || !numero || !descricao) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Configuração do e-mail
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Enviando para o próprio Gmail
      subject: `Nova mensagem de contato - ${nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D9B84A; border-bottom: 2px solid #D9B84A; padding-bottom: 10px;">
            Nova mensagem do site Salita'a Cosmetic
          </h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Informações do contato:</h3>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>E-mail:</strong> ${gmail}</p>
            <p><strong>Número:</strong> ${numero}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #555;">${descricao}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px;">
              <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      `
    };

    // Envio do e-mail
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente mais tarde.'
    });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API Salita\'a Cosmetic funcionando!',
    version: '1.0.0',
    endpoints: {
      'POST /contato': 'Enviar mensagem de contato'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📧 E-mail configurado: ${process.env.GMAIL_USER}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});

module.exports = app;
