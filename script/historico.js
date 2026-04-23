// proteção da página
(async () => {
  const sessao = await pegarSessao();

  if (!sessao) {
    window.location.href = '/login.html';
  }
})();

const listaHistorico = document.querySelector('#historico-lista');
const mensagemHistorico = document.querySelector('#historico-mensagem');

const inputDataInicial = document.querySelector('#filtro-data-inicial');
const inputDataFinal = document.querySelector('#filtro-data-final');
const botaoFiltrar = document.querySelector('#btn-filtrar-historico');
const botaoLimparFiltro = document.querySelector('#btn-limpar-filtro');

const modalEditar = document.querySelector('#modal-editar');
const botaoFecharModal = document.querySelector('#btn-fechar-modal');
const botaoSalvarEdicao = document.querySelector('#btn-salvar-edicao');

const inputEditarData = document.querySelector('#editar-data');
const inputEditarHorario = document.querySelector('#editar-horario');
const inputEditarStatus = document.querySelector('#editar-status');
const mensagemEdicao = document.querySelector('#mensagem-edicao');

const btnLogout = document.querySelector('#btn-logout');
const btnLogoutMobile = document.querySelector('#btn-logout-mobile');

let agendamentoAtualId = null;
let horarioOriginalEdicao = null;


// mensagem
function mostrarMensagemHistorico(texto, tipo) {
  if (!mensagemHistorico) return;

  mensagemHistorico.textContent = texto;
  mensagemHistorico.classList.remove('success', 'error');

  if (tipo) {
    mensagemHistorico.classList.add(tipo);
  }
}

function mostrarMensagemEdicao(texto, tipo) {
  if (!mensagemEdicao) return;

  mensagemEdicao.textContent = texto;
  mensagemEdicao.classList.remove('success', 'error');

  if (tipo) {
    mensagemEdicao.classList.add(tipo);
  }
}


// montar card
function montarCardHistorico(agendamento, servicos) {
  return `
    <article class="historico-card">
      <div class="historico-card__top">
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
        ${servicos.map(item => `
          <p>
            ${item.servicos?.nome || 'Serviço'}
            - status: ${item.status_servico}
          </p>
        `).join('')}
      </div>

      <div class="historico-actions">
        <button
          class="btn btn-light btn-sm"
          data-acao="editar"
          data-id="${agendamento.id}"
          data-data="${agendamento.data}"
          data-horario="${agendamento.horario}"
          data-status="${agendamento.status}"
        >
          Editar
        </button>
      </div>
    </article>
  `;
}


// carregar histórico
async function renderizarHistorico(agendamentos) {
  if (!agendamentos.length) {
    listaHistorico.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    return;
  }

  listaHistorico.innerHTML = '';

  for (const agendamento of agendamentos) {
    const servicos = await buscarServicosDoAgendamento(agendamento.id);

    const card = document.createElement('article');
    card.innerHTML = montarCardHistorico(agendamento, servicos);

    listaHistorico.appendChild(card.firstElementChild);
  }

  adicionarEventosEditar();
}

async function carregarHistorico() {
  const agendamentos = await buscarHistorico();
  renderizarHistorico(agendamentos);
}


// filtro
async function filtrarHistorico() {
  const dataInicial = inputDataInicial.value;
  const dataFinal = inputDataFinal.value;

  const agendamentos = await buscarHistoricoPorPeriodo(dataInicial, dataFinal);
  renderizarHistorico(agendamentos);
}


// modal
function abrirModalEditar(dados) {
  agendamentoAtualId = Number(dados.id);

  inputEditarData.value = dados.data;
  inputEditarHorario.value = dados.horario;
  inputEditarStatus.value = dados.status;
  horarioOriginalEdicao = dados.horario;
  atualizarHorariosModalHistorico();

  mostrarMensagemEdicao('', null);
  modalEditar.classList.remove('hidden');

}

function fecharModalEditar() {
  modalEditar.classList.add('hidden');
  agendamentoAtualId = null;
  horarioOriginalEdicao = null;
}

// atualiza horários disponíveis no modal do admin
async function atualizarHorariosModalHistorico() {
  const dataSelecionada = inputEditarData.value;

  if (!dataSelecionada) return;

  const horariosOcupados = await buscarHorariosOcupados(dataSelecionada);

  Array.from(inputEditarHorario.options).forEach(option => {
    if (!option.value) return;

    // libera tudo antes de verificar
    option.disabled = false;

    // bloqueia horários ocupados, mas mantém o horário atual do agendamento liberado
    if (
      horariosOcupados.includes(option.value) &&
      option.value !== inputEditarHorario.value
    ) {
      option.disabled = true;
    }
  });
}


/// editar
function adicionarEventosEditar() {
  const botoesEditar = document.querySelectorAll('[data-acao="editar"]');

  botoesEditar.forEach(botao => {
    botao.addEventListener('click', () => {
      mostrarMensagemHistorico('', null);

      abrirModalEditar({
        id: botao.dataset.id,
        data: botao.dataset.data,
        horario: botao.dataset.horario,
        status: botao.dataset.status
      });
    });
  });
}


// salvar edição
async function salvarEdicao() {
  if (!agendamentoAtualId) return;

  const dadosAtualizados = {
    data: inputEditarData.value,
    horario: inputEditarHorario.value,
    status: inputEditarStatus.value
  };

  if (!dadosAtualizados.data || !dadosAtualizados.horario) {
    mostrarMensagemEdicao('Preencha data e horário.', 'error');
    return;
  }

  const horariosOcupados = await buscarHorariosOcupados(dadosAtualizados.data);

  if (
    horariosOcupados.includes(dadosAtualizados.horario) &&
    dadosAtualizados.horario !== inputEditarHorario.value
  ) {
    mostrarMensagemEdicao('Esse horário já está ocupado. Escolha outro horário.', 'error');
    return;
  }

  const atualizou = await atualizarAgendamento(agendamentoAtualId, dadosAtualizados);

  if (!atualizou) {
    mostrarMensagemEdicao('Erro ao salvar alterações.', 'error');
    return;
  }

  mostrarMensagemEdicao('Agendamento atualizado com sucesso!', 'success');

  setTimeout(() => {
    fecharModalEditar();
    carregarHistorico();
  }, 800);
}


// eventos
if (botaoFiltrar) {
  botaoFiltrar.addEventListener('click', filtrarHistorico);
}

if (botaoLimparFiltro) {
  botaoLimparFiltro.addEventListener('click', () => {
    inputDataInicial.value = '';
    inputDataFinal.value = '';
    mostrarMensagemHistorico('', null);
    carregarHistorico();
  });
}

if (botaoFecharModal) {
  botaoFecharModal.addEventListener('click', fecharModalEditar);
}

if (botaoSalvarEdicao) {
  botaoSalvarEdicao.addEventListener('click', salvarEdicao);
}

if (inputEditarData) {
  inputEditarData.addEventListener('change', atualizarHorariosModalHistorico);
}


// logout
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    await fazerLogout();
    window.location.href = '/login.html';
  });
}

if (btnLogoutMobile) {
  btnLogoutMobile.addEventListener('click', async () => {
    await fazerLogout();
    window.location.href = '/login.html';
  });
}


carregarHistorico();