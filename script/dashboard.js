// proteção de rota
(async () => {
  const sessao = await pegarSessao();

  // se não estiver logado, manda pro login
  if (!sessao) {
    window.location.href = '/login.html';
  }
})();

const dashboardLista = document.querySelector('#dashboard-lista');
const dashboardMensagem = document.querySelector('#dashboard-mensagem');

const totalAgendamentos = document.querySelector('#total-agendamentos');
const totalPendentes = document.querySelector('#total-pendentes');
const totalConfirmados = document.querySelector('#total-confirmados');
const totalConcluidos = document.querySelector('#total-concluidos');
const totalCancelados = document.querySelector('#total-cancelados');
const rankingServicos = document.querySelector('#ranking-servicos');


// mensagem
function mostrarMensagemDashboard(texto, tipo) {
  if (!dashboardMensagem) return;

  dashboardMensagem.textContent = texto;
  dashboardMensagem.classList.remove('success', 'error');

  if (tipo) {
    dashboardMensagem.classList.add(tipo);
  }
}


// atualiza os cards com base nas métricas da semana
async function atualizarResumoDashboard() {
  // busca dados consolidados da semana no supabase
  const metricas = await buscarMetricasSemana();

  // se der erro ou não vier nada, não faz nada
  if (!metricas) return;

  // atualiza os números principais
  totalAgendamentos.textContent = metricas.total;
  totalPendentes.textContent = metricas.pendentes;
  totalConfirmados.textContent = metricas.confirmados;
  totalConcluidos.textContent = metricas.concluidos;
  totalCancelados.textContent = metricas.cancelados;

  // atualiza o ranking de serviços
  renderizarRankingServicos(metricas.servicosSemana);
}


// monta e exibe o ranking de serviços mais agendados na semana
function renderizarRankingServicos(servicosSemana) {
  if (!rankingServicos) return;

  // se não tiver serviços na semana
  if (!servicosSemana.length) {
    rankingServicos.innerHTML = '<p>Nenhum serviço agendado nesta semana.</p>';
    return;
  }

  // objeto para contar quantas vezes cada serviço aparece
  const contagem = {};

  servicosSemana.forEach(item => {
    const nome = item.servicos?.nome || 'Serviço';

    // soma +1 para cada ocorrência
    contagem[nome] = (contagem[nome] || 0) + 1;
  });

  // transforma em array e ordena do mais usado para o menos usado
  const ranking = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1]);

  // monta o HTML do ranking
  rankingServicos.innerHTML = ranking.map(([nome, quantidade]) => `
    <div class="ranking-item">
      <strong>${nome}</strong>
      <span>${quantidade} agendamento(s)</span>
    </div>
  `).join('');
}


// montar card
function montarCardDashboard(agendamento, servicos) {
  return `
    <article class="dashboard-item">
      <div class="dashboard-item__top">
        <div>
          <h4>${agendamento.clientes?.nome || 'Cliente não encontrado'}</h4>
          <p>${agendamento.clientes?.email || ''}</p>
          <p>${agendamento.clientes?.telefone || ''}</p>
        </div>

        <div>
          <span class="status-badge">${agendamento.status}</span>
        </div>
      </div>

      <p><strong>Data:</strong> ${agendamento.data}</p>
      <p><strong>Horário:</strong> ${agendamento.horario}</p>

      <div class="historico-servicos">
        <strong>Serviços:</strong>
        ${servicos.length
          ? servicos.map(item => `
              <p>${item.servicos?.nome || 'Serviço'} - status: ${item.status_servico}</p>
            `).join('')
          : '<p>Nenhum serviço encontrado.</p>'
        }
      </div>

      <div class="dashboard-actions">
        <button class="btn btn-light btn-sm" data-acao="confirmar" data-id="${agendamento.id}">
          Confirmar
        </button>

        <button class="btn btn-light btn-sm" data-acao="concluir" data-id="${agendamento.id}">
          Concluir
        </button>

        <button class="btn btn-outline btn-sm" data-acao="cancelar" data-id="${agendamento.id}">
          Cancelar
        </button>
      </div>
    </article>
  `;
}


// carregar dashboard
async function carregarDashboard() {
  const agendamentos = await buscarAgendamentosDashboard();

// atualiza os cards com base na semana atual
await atualizarResumoDashboard();

  if (!agendamentos.length) {
    dashboardLista.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    return;
  }

  dashboardLista.innerHTML = '';

  for (const agendamento of agendamentos) {
    const servicos = await buscarServicosDoAgendamento(agendamento.id);
    dashboardLista.innerHTML += montarCardDashboard(agendamento, servicos);
  }

  adicionarEventosAcoes();
}


// ações
function adicionarEventosAcoes() {
  const botoes = document.querySelectorAll('[data-acao]');

  botoes.forEach(botao => {
    botao.addEventListener('click', async () => {
      const id = Number(botao.dataset.id);
      const acao = botao.dataset.acao;

      let novoStatusAgendamento = '';
      let novoStatusServico = '';

      if (acao === 'confirmar') {
        novoStatusAgendamento = 'confirmado';
        novoStatusServico = 'pendente';
      }

      if (acao === 'concluir') {
        novoStatusAgendamento = 'concluido';
        novoStatusServico = 'concluido';
      }

      if (acao === 'cancelar') {
        novoStatusAgendamento = 'cancelado';
        novoStatusServico = 'cancelado';
      }

      const atualizouAgendamento = await atualizarStatusAgendamento(id, novoStatusAgendamento);
      const atualizouServicos = await atualizarStatusServicosDoAgendamento(id, novoStatusServico);

      if (!atualizouAgendamento || !atualizouServicos) {
        mostrarMensagemDashboard('Erro ao atualizar status.', 'error');
        return;
      }

      mostrarMensagemDashboard('Status atualizado com sucesso!', 'success');
      carregarDashboard();
    });
  });
}

carregarDashboard();

const btnLogout = document.querySelector('#btn-logout');

if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    await fazerLogout();
    window.location.href = '/login.html';
  });
}