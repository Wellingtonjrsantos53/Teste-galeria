// Importa os módulos necessários
const express = require('express');
const bodyParser = require('body-parser');
const mercadopago = require('mercadopago');
const cors = require('cors'); // Habilita o CORS para permitir requisições do front-end

// Cria uma nova aplicação Express
const app = express();
// No Vercel, a porta é definida pela variável de ambiente PORT. Usamos 3000 como fallback local.
const port = 3000; 

// Use middlewares
app.use(bodyParser.json());
app.use(cors()); // Habilita o CORS para todas as origens

// --- ALTERAÇÃO ESSENCIAL: Lendo a Variável de Ambiente ---
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
    console.error("ERRO: Variável de ambiente MP_ACCESS_TOKEN não está configurada!");
    // Em um ambiente Vercel, o servidor pode falhar ao iniciar aqui.
    // Para fins de deploy, apenas avisamos, mas a falha ocorrerá no .create() se a variável não estiver lá.
}

// Configura o Mercado Pago usando a chave do ambiente
const client = new mercadopago.MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
});

// Cria o serviço de pagamento fora do endpoint para reutilização
const paymentService = new mercadopago.Payment(client);

// Endpoint para criar um pagamento via Pix ou Cartão de Crédito
app.post('/create_payment', async (req, res) => {
    try {
        const { transaction_amount, description, payer, payment_method_id } = req.body;

        if (!paymentService) {
            return res.status(500).json({ error: 'Serviço do Mercado Pago não inicializado. Verifique o Access Token.' });
        }
        
        let paymentData = {
            transaction_amount: Number(transaction_amount),
            description: description,
            payer: {
                email: payer.email,
                first_name: payer.first_name,
                last_name: payer.last_name,
                identification: payer.identification
            }
        };

        let paymentResult;

        if (payment_method_id === 'pix') {
            // Lógica para pagamento via Pix
            paymentData.payment_method_id = 'pix';
            
            paymentResult = await paymentService.create({ body: paymentData });
            
            // Retorna o QR Code e o código para o front-end
            const qrCodeBase64 = paymentResult.point_of_interaction?.transaction_data?.qr_code_base64;
            const qrCodeText = paymentResult.point_of_interaction?.transaction_data?.qr_code;
            
            console.log("Pagamento Pix criado com sucesso. ID:", paymentResult.id);
            res.json({ qr_code_base64: qrCodeBase64, qr_code_text: qrCodeText, payment_id: paymentResult.id });

        } else if (payment_method_id === 'credit_card') {
            // Lógica para pagamento via Cartão de Crédito (MANTIDA)
            // OBS: Esta lógica requer tokenização de cartão no frontend, aqui apenas um placeholder.
            paymentData.payment_method_id = 'master'; 
            paymentData.installments = 1;

            paymentResult = await paymentService.create({ body: paymentData });
            
            res.json({ status: paymentResult.status, status_detail: paymentResult.status_detail, payment_id: paymentResult.id });
            console.log("Pagamento Cartão criado com sucesso. ID:", paymentResult.id);

        } else {
            res.status(400).json({ error: 'Método de pagamento não suportado' });
        }

    } catch (error) {
        console.error("Erro ao criar o pagamento:", error);
        
        // Tenta retornar o erro detalhado do Mercado Pago
        const mpError = error.cause && error.cause.length > 0 ? error.cause[0] : null;

        res.status(500).json({ 
            error: mpError ? `${mpError.code}: ${mpError.description}` : 'Erro interno ao processar o pagamento',
            details: mpError
        });
    }
});

// Inicia o servidor (usando a porta do Vercel ou a porta local)
app.listen(process.env.PORT || port, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT || port}`);
    console.log(`Status do Token: ${ACCESS_TOKEN ? 'Carregado de MP_ACCESS_TOKEN' : 'NÃO CONFIGURADO'}`);
});