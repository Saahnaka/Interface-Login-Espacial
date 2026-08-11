require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json());
app.use(cors());

// =====================================================
// CONFIGURAÇÃO DO SUPABASE
// =====================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verifica se o .env está sendo carregado

console.log("SUPABASE_URL encontrada:", !!supabaseUrl);

console.log("SUPABASE_KEY encontrada:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "ERRO: SUPABASE_URL ou SUPABASE_KEY não foram encontradas no arquivo .env.",
  );

  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// TESTE DO SERVIDOR
// =====================================================

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

// =====================================================
// CADASTRO
// =====================================================

app.post(
  "/api/registrar",

  async (req, res) => {
    console.log("");
    console.log("==============================");
    console.log("NOVA TENTATIVA DE CADASTRO");

    const { email, senha } = req.body;

    console.log("E-mail recebido:", email);

    // Nunca mostramos a senha no console
    console.log("Senha recebida:", senha ? "SIM" : "NÃO");

    if (!email || !senha) {
      console.log("ERRO: e-mail ou senha vazios.");

      return res.status(400).json({
        mensagem: "Preencha o e-mail e a senha.",
      });
    }

    try {
      console.log("Enviando cadastro para o Supabase...");

      const { data, error } = await supabase.auth.signUp({
        email: email,

        password: senha,
      });

      // =================================================
      // ERRO DO SUPABASE
      // =================================================

      if (error) {
        console.error("");
        console.error("ERRO DO SUPABASE NO CADASTRO");

        console.error("Mensagem:", error.message);

        console.error("Status:", error.status);

        console.error("Código:", error.code);

        console.error("Nome:", error.name);

        console.error("Erro completo:", error);

        /*
          TEMPORARIAMENTE enviamos a mensagem
          original para o navegador.

          Isso é só para descobrir qual é
          o erro verdadeiro.
        */

        return res.status(error.status || 400).json({
          mensagem: error.message,
        });
      }

      // =================================================
      // CADASTRO ACEITO
      // =================================================

      console.log("");
      console.log("CADASTRO ACEITO PELO SUPABASE");

      console.log("Usuário:", data.user?.email);

      console.log("ID:", data.user?.id);

      console.log("Sessão criada:", !!data.session);

      return res.status(201).json({
        mensagem:
          "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.",
      });
    } catch (error) {
      console.error("");
      console.error("ERRO INESPERADO NO CADASTRO");

      console.error(error);

      return res.status(500).json({
        mensagem: "Erro interno do servidor ao realizar o cadastro.",
      });
    }
  },
);

// =====================================================
// LOGIN
// =====================================================

app.post(
  "/api/login",

  async (req, res) => {
    console.log("");
    console.log("==============================");
    console.log("NOVA TENTATIVA DE LOGIN");

    const { email, senha } = req.body;

    console.log("E-mail recebido:", email);

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha o e-mail e a senha.",
      });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,

        password: senha,
      });

      if (error) {
        console.error("");
        console.error("ERRO DO SUPABASE NO LOGIN");

        console.error("Mensagem:", error.message);

        console.error("Status:", error.status);

        console.error("Código:", error.code);

        return res.status(error.status || 401).json({
          mensagem: error.message,
        });
      }

      console.log("LOGIN REALIZADO COM SUCESSO");

      console.log("Usuário:", data.user?.email);

      return res.status(200).json({
        mensagem: "Login realizado com sucesso!",

        usuario: data.user,

        sessao: data.session,
      });
    } catch (error) {
      console.error("ERRO INESPERADO NO LOGIN:");

      console.error(error);

      return res.status(500).json({
        mensagem: "Erro interno do servidor ao fazer login.",
      });
    }
  },
);

// =====================================================
// RECUPERAÇÃO DE SENHA
// =====================================================

app.post(
  "/api/recuperar-senha",

  async (req, res) => {
    console.log("");
    console.log("==============================");
    console.log("RECUPERAÇÃO DE SENHA");

    const { email } = req.body;

    console.log("E-mail recebido:", email);

    if (!email) {
      return res.status(400).json({
        mensagem: "Informe seu endereço de e-mail.",
      });
    }

    try {
      console.log("Solicitando e-mail de recuperação...");

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://127.0.0.1:5500/index.html",
      });

      if (error) {
        console.error("");
        console.error("ERRO DO SUPABASE NA RECUPERAÇÃO");

        console.error("Mensagem:", error.message);

        console.error("Status:", error.status);

        console.error("Código:", error.code);

        console.error("Erro completo:", error);

        return res.status(error.status || 400).json({
          mensagem: error.message,
        });
      }

      console.log("E-mail de recuperação solicitado com sucesso.");

      return res.status(200).json({
        mensagem:
          "E-mail de recuperação enviado! Verifique sua caixa de entrada.",
      });
    } catch (error) {
      console.error("ERRO INESPERADO NA RECUPERAÇÃO");

      console.error(error);

      return res.status(500).json({
        mensagem: "Erro interno do servidor ao recuperar a senha.",
      });
    }
  },
);

// =====================================================
// ROTA NÃO ENCONTRADA
// =====================================================

app.use((req, res) => {
  console.log("Rota não encontrada:", req.method, req.url);

  return res.status(404).json({
    mensagem: "Rota não encontrada.",
  });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORTA = 3000;

app.listen(
  PORTA,

  () => {
    console.log("");
    console.log("==============================");
    console.log("SERVIDOR INICIADO");
    console.log(`http://localhost:${PORTA}`);
    console.log("==============================");
    console.log("");
  },
);
