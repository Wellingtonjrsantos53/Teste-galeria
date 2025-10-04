// Importa os módulos necessários
const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors');

// ATENÇÃO: Assegure-se de que o pacote 'crypto' ou 'uuid' está instalado se for usar crypto.randomUUID().
// Se não, remova o requestOptions que usa essa função.

// Cria uma nova aplicação Express
const app = express();
const port = 3000;

// Use middlewares
app.use(cors()); // Habilita o CORS para permitir requisições do front-end
app.use(express.json()); // Usar express.json() em vez de body-parser.json() para versões recentes do Express

// Configura o Mercado Pago com sua chave de acesso.
// --- APLICANDO CREDENCIAL DE PRODUÇÃO ---
const ACCESS_TOKEN_PRODUCAO = 'APP_USR-8155657262249649-091319-ee52419ad3994e7b101524cd6c6fd5ee-290268833';

const client = new MercadoPagoConfig({
    accessToken: ACCESS_TOKEN_PRODUCAO,
});
const paymentService = new Payment(client); // Cria a instância do serviço de pagamento

// --- Endpoint para criar pagamento PIX ---
app.post('/create_payment', async (req, res) => {
    try {
        // Recebe os dados do front-end
        const { transaction_amount, description, payer } = req.body;

        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: description || 'Pagamento de Projeto WR Arquitetura',
            payment_method_id: 'pix',
            payer: {
                email: payer.email,
                first_name: payer.first_name,
                last_name: payer.last_name,
                identification: payer.identification
            }
        };

        // NOTA: Removida a lógica condicional de credit_card e a dependência de crypto.randomUUID()
        // para simplificar e focar apenas no PIX, que é o objetivo principal.

        const result = await paymentService.create({ body: paymentData });

        // Retorna os dados necessários para o frontend
        res.json({
            success: true,
            payment_id: result.id,
            status: result.status,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            qr_code_text: result.point_of_interaction?.transaction_data?.qr_code
        });

    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
        
        // Se for um erro do Mercado Pago (com status), retorna o status do erro
        const mpError = error.cause && error.cause.length > 0 ? error.cause[0] : null;

        res.status(500).json({
            success: false,
            error: mpError ? `${mpError.code}: ${mpError.description}` : 'Erro interno ao processar o pagamento'
        });
    }
});

// --- Endpoint para verificar status do pagamento (MANTIDO) ---
app.get('/payment_status/:payment_id', async (req, res) => {
    try {
        const { payment_id } = req.params;
        const result = await paymentService.get({ id: payment_id });
        
        res.json({
            success: true,
            status: result.status,
            status_detail: result.status_detail
        });
    } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// O Vercel define a porta automaticamente através da variável de ambiente 'PORT'
app.listen(process.env.PORT || port, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT || port}`);
    console.log("ATENÇÃO: Credenciais de PRODUÇÃO ativas.");
});