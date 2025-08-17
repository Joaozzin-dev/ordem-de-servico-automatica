const admin = require('firebase-admin');

// Inicializar Firebase Admin com service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function criarOSAutomatica() {
  console.log('🚀 Iniciando criação de OS automática...');
  
  try {
    // Calcular data de hoje no timezone de Brasília
    const agora = new Date();
    const brasiliaOffset = -3; // UTC-3
    const horarioBrasilia = new Date(agora.getTime() + (brasiliaOffset * 60 * 60 * 1000));
    
    const hoje = horarioBrasilia.toISOString().split('T')[0];
    const hojeISO = horarioBrasilia.toISOString();
    
    console.log(`📅 Buscando OS para a data: ${hoje}`);
    
    // Buscar TODAS as OS que têm proximaManutencao (qualquer tipo de serviço)
    const osSnapshot = await db.collection('ordens_de_servico')
      .where('proximaManutencao', '!=', null)
      .get();
    
    console.log(`📋 Encontradas ${osSnapshot.size} OS com proximaManutencao definida.`);
    
    if (osSnapshot.empty) {
      console.log('✅ Nenhuma OS encontrada.');
      return { success: true, osCreated: 0, message: 'Nenhuma OS para processar' };
    }
    
    let osCreated = 0;
    let osDuplicadas = 0;
    let osForaData = 0;
    const erros = [];
    
    // Processar cada documento
    for (const doc of osSnapshot.docs) {
      try {
        const osData = doc.data();
        const docId = doc.id;
        
        // Extrair data da proximaManutencao (pode ser string ou timestamp)
        let proximaManutencaoData;
        
        if (typeof osData.proximaManutencao === 'string') {
          // Se for string no formato ISO (2025-08-17T03:10:36.672Z)
          proximaManutencaoData = osData.proximaManutencao.split('T')[0];
        } else if (osData.proximaManutencao?.toDate) {
          // Se for Firestore Timestamp
          proximaManutencaoData = osData.proximaManutencao.toDate().toISOString().split('T')[0];
        } else {
          console.log(`⚠️  Formato de data inválido para ${osData.cliente}: ${osData.proximaManutencao}`);
          continue;
        }
        
        // Verificar se a data da próxima manutenção é hoje
        if (proximaManutencaoData !== hoje) {
          osForaData++;
          continue;
        }
        
        console.log(`🔧 Processando: ${osData.cliente} - Tipo: ${osData.tipoServico}`);
        
        // Verificar duplicatas
        const existingOSSnapshot = await db.collection('ordens_de_servico')
          .where('cliente', '==', osData.cliente)
          .where('datainfo', '==', hoje)
          .get();
        
        if (!existingOSSnapshot.empty) {
          console.log(`⚠️  OS já existe para ${osData.cliente}. Ignorando.`);
          osDuplicadas++;
          continue;
        }
        
        // Criar nova OS
        const novaOS = {
          cliente: osData.cliente || '',
          telefone: osData.telefone || '',
          tipoServico: osData.tipoServico || '',
          endereco: osData.endereco || '',
          cep: osData.cep || '',
          cidade: osData.cidade || '',
          equipamentosUsados: osData.equipamentosUsados || [],
          data: hojeISO,
          datainfo: hoje,
          ehManutencaoAutomatica: true,
          status: 'Pendente',
          criadoEm: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Salvar nova OS
        await db.collection('ordens_de_servico').add(novaOS);
        console.log(`✅ OS criada para: ${osData.cliente} - ${osData.tipoServico}`);
        osCreated++;
        
        // Atualizar próxima manutenção
        const proximaManutencao = calcularProximaManutencao(hoje, osData.intervaloManutencao);
        
        await db.collection('ordens_de_servico').doc(docId).update({
          proximaManutencao: proximaManutencao
        });
        
        console.log(`📅 Próxima manutenção: ${proximaManutencao}`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar OS ${doc.id}:`, error);
        erros.push({ docId: doc.id, error: error.message });
      }
    }
    
    // Resultado final
    console.log(`🎉 Processo finalizado!`);
    console.log(`✅ OS criadas: ${osCreated}`);
    console.log(`⚠️  Duplicadas ignoradas: ${osDuplicadas}`);
    console.log(`📊 Fora da data: ${osForaData}`);
    console.log(`❌ Erros: ${erros.length}`);
    
    return {
      success: true,
      osCreated,
      osDuplicadas,
      osForaData,
      erros: erros.length,
      timestamp: hoje
    };
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
    throw error;
  }
}

function calcularProximaManutencao(dataAtual, intervalo) {
  const data = new Date(dataAtual + 'T00:00:00.000Z');
  
  if (!intervalo) {
    data.setMonth(data.getMonth() + 1);
  } else {
    const matches = intervalo.match(/(\d+)\s*m[eê]s/i);
    const meses = matches ? parseInt(matches[1]) : 1;
    data.setMonth(data.getMonth() + meses);
  }
  
  return data.toISOString().split('T')[0];
}

// Executar função
criarOSAutomatica()
  .then(resultado => {
    console.log('🏁 Execução concluída:', resultado);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Execução falhou:', error);
    process.exit(1);
  });
