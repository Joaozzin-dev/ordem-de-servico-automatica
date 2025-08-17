# ordem-de-servico-automatica
🚀 Sistema de Criação Automática de Ordens de Serviço
📋 README.md para GitHub
markdown# 🔧 Automated Service Order Creator

**Sistema inteligente de automação para criação de Ordens de Serviço preventivas usando Firebase e Node.js**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Sobre o Projeto

Sistema de automação que monitora diariamente as datas de manutenção preventiva e cria automaticamente Ordens de Serviço **um dia antes** da data programada, garantindo que os técnicos sempre estejam preparados para executar os serviços.

### ✨ Características Principais

- 🤖 **Automação Inteligente**: Criação automática de OS baseada em cronograma
- 📅 **Planejamento Antecipado**: OS criadas um dia antes da manutenção
- 🔄 **Ciclo Completo**: Atualização automática da próxima data de manutenção
- 🛡️ **Anti-Duplicação**: Verificação para evitar OS duplicadas
- 🌍 **Timezone Brasil**: Cálculos ajustados para horário de Brasília (UTC-3)
- 📊 **Logs Detalhados**: Monitoramento completo do processo

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Firebase Admin SDK** - Banco de dados e autenticação
- **Firestore** - Banco NoSQL para armazenamento
- **JavaScript ES6+** - Linguagem de programação

## ⚙️ Como Funciona

Sistema roda diariamente (hoje)
↓
Busca OS com proximaManutencao = amanhã
↓
Verifica se já existe OS para o mesmo cliente/data
↓
Cria nova OS com status "Pendente"
↓
Atualiza próxima data de manutenção
↓
Técnicos executam serviços no dia seguinte

📊 Estrutura dos Dados
Documento de Entrada (Modelo de Manutenção)
javascript{
  cliente: "Nome do Cliente",
  telefone: "(11) 99999-9999",
  tipoServico: "PMOC",
  endereco: "Rua exemplo, 123",
  proximaManutencao: "2025-08-18T03:10:36.672Z",
  intervaloManutencao: "3 mês",
  equipamentosUsados: ["Equipamento 1", "Equipamento 2"]
}
OS Criada Automaticamente
javascript{
  cliente: "Nome do Cliente",
  data: "2025-08-17T10:30:00.000Z",
  datainfo: "2025-08-17",
  status: "Pendente",
  ehManutencaoAutomatica: true,
  criadoEm: "Timestamp do Firebase"
}
📈 Resultados do Sistema
javascript{
  success: true,
  osCreated: 15,        // OS criadas com sucesso
  osDuplicadas: 2,      // Duplicatas evitadas
  osForaData: 108,      // OS com datas diferentes
  erros: 0,             // Erros encontrados
  timestamp: "2025-08-17"
}
🔧 Personalização
Intervalos de Manutenção Suportados

"1 mês" ou "1 mes"
"3 meses" ou "3 mes"
"6 meses" ou "6 mes"
Padrão: 1 mês (se não especificado)

Agendamento Automático
Recomenda-se configurar este script para rodar diariamente via:

Cron Job (Linux/macOS)
Task Scheduler (Windows)
GitHub Actions (CI/CD)
Google Cloud Functions (Serverless)

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
👨‍💻 Autor
Joaozzin-dev

LinkedIn: https://www.linkedin.com/in/jo%C3%A3o-pedro-rodrigues-de-souza-8a440627a/
GitHub: https://github.com/Joaozzin-dev
Email: joao-rodrigues.jr@aluno.unb.br


⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!
