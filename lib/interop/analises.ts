/**
 * Análises práticas usando a nova estrutura de movimentos
 */

import { InteropProcessoType } from './interop-types';

// Análise 1: Produtividade por responsável
export function analiseProdutividade(processo: InteropProcessoType) {
  console.log('📊 ANÁLISE DE PRODUTIVIDADE POR RESPONSÁVEL\n');

  const produtividade = new Map<string, {
    movimentos: number;
    documentos: number;
    tiposMovimento: Set<string>;
  }>();

  processo.movimentosEDocumentos.forEach(movimento => {
    const responsavel = movimento.responsavel || 'Sistema';

    if (!produtividade.has(responsavel)) {
      produtividade.set(responsavel, {
        movimentos: 0,
        documentos: 0,
        tiposMovimento: new Set()
      });
    }

    const stats = produtividade.get(responsavel)!;
    stats.movimentos++;
    stats.documentos += movimento.documentos.length;
    stats.tiposMovimento.add(movimento.tipo.nome);
  });

  // Ordenar por número de movimentos
  const ranking = Array.from(produtividade.entries())
    .sort((a, b) => b[1].movimentos - a[1].movimentos);

  ranking.forEach(([responsavel, stats], index) => {
    console.log(`${index + 1}. ${responsavel}`);
    console.log(`   Movimentos: ${stats.movimentos}`);
    console.log(`   Documentos: ${stats.documentos}`);
    console.log(`   Tipos: ${Array.from(stats.tiposMovimento).join(', ')}`);
    console.log();
  });

  return ranking;
}

// Análise 2: Fluxo temporal do processo
export function analiseFluxoTemporal(processo: InteropProcessoType) {
  console.log('⏱️ ANÁLISE DE FLUXO TEMPORAL\n');

  const movimentosOrdenados = [...processo.movimentosEDocumentos]
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

  let intervalos: number[] = [];

  for (let i = 1; i < movimentosOrdenados.length; i++) {
    const anterior = new Date(movimentosOrdenados[i - 1].dataHora);
    const atual = new Date(movimentosOrdenados[i].dataHora);
    const diffDias = (atual.getTime() - anterior.getTime()) / (1000 * 60 * 60 * 24);
    intervalos.push(diffDias);
  }

  const tempoMedio = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
  const tempoMinimo = Math.min(...intervalos);
  const tempoMaximo = Math.max(...intervalos);

  console.log(`Tempo médio entre movimentos: ${tempoMedio.toFixed(1)} dias`);
  console.log(`Menor intervalo: ${tempoMinimo.toFixed(1)} dias`);
  console.log(`Maior intervalo: ${tempoMaximo.toFixed(1)} dias`);

  // Períodos de inatividade (> 30 dias)
  const inatividade = intervalos.filter(dias => dias > 30);
  console.log(`Períodos de inatividade (>30 dias): ${inatividade.length}`);

  if (inatividade.length > 0) {
    console.log(`Maior período de inatividade: ${Math.max(...inatividade).toFixed(1)} dias`);
  }

  return {
    tempoMedio,
    tempoMinimo,
    tempoMaximo,
    periodosInatividade: inatividade.length
  };
}

// Análise 3: Análise de documentos por tipo
export function analiseDocumentosPorTipo(processo: InteropProcessoType) {
  console.log('📄 ANÁLISE DE DOCUMENTOS POR TIPO\n');

  const estatisticas = new Map<string, {
    quantidade: number;
    paginasTotal: number;
    tamanhoTotal: number;
    movimentosAssociados: Set<number>;
    signatarios: Set<string>;
  }>();

  processo.movimentosEDocumentos.forEach(movimento => {
    movimento.documentos.forEach(doc => {
      if (!estatisticas.has(doc.tipoDocumento)) {
        estatisticas.set(doc.tipoDocumento, {
          quantidade: 0,
          paginasTotal: 0,
          tamanhoTotal: 0,
          movimentosAssociados: new Set(),
          signatarios: new Set()
        });
      }

      const stats = estatisticas.get(doc.tipoDocumento)!;
      stats.quantidade++;
      stats.paginasTotal += doc.quantidadePaginas;
      stats.tamanhoTotal += doc.tamanho;
      stats.movimentosAssociados.add(movimento.sequencia);
      doc.signatarios.forEach(sig => stats.signatarios.add(sig));
    });
  });

  // Ordenar por quantidade
  const ranking = Array.from(estatisticas.entries())
    .sort((a, b) => b[1].quantidade - a[1].quantidade);

  ranking.forEach(([tipo, stats]) => {
    console.log(`📎 ${tipo}`);
    console.log(`   Quantidade: ${stats.quantidade}`);
    console.log(`   Páginas total: ${stats.paginasTotal}`);
    console.log(`   Tamanho total: ${(stats.tamanhoTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Movimentos: ${stats.movimentosAssociados.size}`);
    console.log(`   Signatários únicos: ${stats.signatarios.size}`);
    console.log();
  });

  return ranking;
}

// Análise 4: Padrões de juntada de documentos
export function analisePadroesJuntada(processo: InteropProcessoType) {
  console.log('🔄 ANÁLISE DE PADRÕES DE JUNTADA\n');

  const movimentosComDocs = processo.movimentosEDocumentos.filter(m => m.documentos.length > 0);
  const movimentosSemDocs = processo.movimentosEDocumentos.filter(m => m.documentos.length === 0);

  console.log(`Movimentos com documentos: ${movimentosComDocs.length} (${((movimentosComDocs.length / processo.movimentosEDocumentos.length) * 100).toFixed(1)}%)`);
  console.log(`Movimentos sem documentos: ${movimentosSemDocs.length} (${((movimentosSemDocs.length / processo.movimentosEDocumentos.length) * 100).toFixed(1)}%)`);

  // Análise de múltiplos documentos por movimento
  const multiplosDocumentos = movimentosComDocs.filter(m => m.documentos.length > 1);
  console.log(`\nMovimentos com múltiplos documentos: ${multiplosDocumentos.length}`);

  if (multiplosDocumentos.length > 0) {
    const maxDocumentos = Math.max(...movimentosComDocs.map(m => m.documentos.length));
    const movComMax = movimentosComDocs.find(m => m.documentos.length === maxDocumentos);

    console.log(`Maior quantidade de documentos em um movimento: ${maxDocumentos}`);
    console.log(`Movimento: "${movComMax?.descricao}"`);
  }

  // Tipos de movimento que mais geram documentos
  const tiposComDocs = new Map<string, number>();
  movimentosComDocs.forEach(movimento => {
    const tipo = movimento.tipo.nome;
    tiposComDocs.set(tipo, (tiposComDocs.get(tipo) || 0) + movimento.documentos.length);
  });

  const rankingTipos = Array.from(tiposComDocs.entries())
    .sort((a, b) => b[1] - a[1]);

  console.log('\nTipos de movimento que mais geram documentos:');
  rankingTipos.slice(0, 5).forEach(([tipo, quantidade], index) => {
    console.log(`${index + 1}. ${tipo}: ${quantidade} documentos`);
  });

  return {
    movimentosComDocumentos: movimentosComDocs.length,
    movimentosSemDocumentos: movimentosSemDocs.length,
    movimentosComMultiplosDocumentos: multiplosDocumentos.length,
    tiposMaisDocumentados: rankingTipos
  };
}

// Função principal que executa todas as análises
export function executarAnaliseCompleta(processo: InteropProcessoType) {
  console.log('🔍 ANÁLISE COMPLETA DO PROCESSO\n');
  console.log(`Processo: ${processo.numeroProcesso}`);
  console.log(`Tribunal: ${processo.tribunal.nome}`);
  console.log(`Total de movimentos: ${processo.movimentosEDocumentos.length}`);
  console.log('\n' + '='.repeat(60) + '\n');

  const produtividade = analiseProdutividade(processo);
  console.log('='.repeat(60) + '\n');

  const fluxo = analiseFluxoTemporal(processo);
  console.log('\n' + '='.repeat(60) + '\n');

  const documentos = analiseDocumentosPorTipo(processo);
  console.log('='.repeat(60) + '\n');

  const padroes = analisePadroesJuntada(processo);

  return {
    produtividade,
    fluxo,
    documentos,
    padroes
  };
}

// Função para exportar dados para relatório
export function gerarRelatorioProcesso(processo: InteropProcessoType) {
  const analises = executarAnaliseCompleta(processo);

  const relatorio = {
    processo: {
      numero: processo.numeroProcesso,
      tribunal: processo.tribunal,
      classe: processo.classe,
      natureza: processo.natureza,
      instancia: processo.instancia
    },
    partes: {
      poloAtivo: processo.partes.poloAtivo.map(p => ({
        nome: p.nome,
        tipo: p.tipo,
        representantes: p.representantes.length
      })),
      poloPassivo: processo.partes.poloPassivo.map(p => ({
        nome: p.nome,
        tipo: p.tipo,
        representantes: p.representantes.length
      }))
    },
    estatisticas: {
      totalMovimentos: processo.movimentosEDocumentos.length,
      totalDocumentos: processo.movimentosEDocumentos.reduce((total, m) => total + m.documentos.length, 0),
      fluxoTemporal: analises.fluxo,
      produtividade: analises.produtividade.slice(0, 5), // Top 5
      padroes: analises.padroes
    },
    timeline: processo.movimentosEDocumentos.map(m => ({
      sequencia: m.sequencia,
      data: m.dataHora,
      descricao: m.descricao,
      responsavel: m.responsavel,
      quantidadeDocumentos: m.documentos.length
    }))
  };

  return relatorio;
}
