const inputConsultaEmail = document.querySelector('#consulta-email');
const botaoConsultar = document.querySelector('#btn-consultar');
const mensagemConsulta = document.querySelector('#mensagem-consulta');
const listaConsulta = document.querySelector('#consulta-lista');

const modalEditarConsulta = document.querySelector('#modal-editar-consulta');
const botaoFecharModalConsulta = document.querySelector('#btn-fechar-modal-consulta');
const botaoSalvarEdicaoConsulta = document.querySelector('#btn-salvar-edicao-consulta');

const inputEditarConsultaData = document.querySelector('#editar-consulta-data');
const inputEditarConsultaHorario = document.querySelector('#editar-consulta-horario');
const mensagemEdicaoConsulta = document.querySelector('#mensagem-edicao-consulta');

let agendamentoConsultaAtualId = null;


// mensagem
function mostrarMensagemConsulta(texto, tipo) {
  if (!mensagemConsulta) return;

  mensagemConsulta.textContent = texto;
  mensagemConsulta.classList.remove('success', 'error');

  if (tipo) {
    mensagemConsulta.classList.add(tipo);
  }
}

function mostrarMensagemEdicaoConsulta(texto, tipo) {
  if (!mensagemEdicaoConsulta) return;

  mensagemEdicaoConsulta.textContent = texto;
  mensagemEdicaoConsulta.classList.remove('success', 'error');

  if (tipo) {
    mensagemEdicaoConsulta.classList.add(tipo);
  }
}


// regra dos 2 dias
function podeEditarAgendamento(dataAgendamento) {
  const hoje = new Date();
  const data = new Date(`${dataAgendamento}T00:00:00`);

  const diferencaMs = data - hoje;
  const diferencaDias = diferencaMs / (1000 * 60 * 60 * 24);

  return diferencaDias >= 2;
}


// montar card
function montarCardAgendamento(agendamento, servicos) {
  const podeEditar = podeEditarAgendamento(agendamento.data);

  return `
    <article class="consulta-card">
      <div class="consulta-card__top">
        <div>
          <h4>Agendamento #${agendamento.id}</h4>
          <p><strong>Data:</strong> ${agendamento.data}</p>
          <p><strong>Horário:</strong> ${agendamento.horario}</p>
        </div>

        <span class="status-badge">${agendamento.status}</span>
      </div>

      <div class="consulta-servicos">
        <strong>Serviços:</strong>
        ${servicos.length
          ? servicos.map(item => `
              <p>${item.servicos?.nome || 'Serviço'} - status: ${item.status_servico}</p>
            `).join('')
          : '<p>Nenhum serviço encontrado.</p>'
        }
      </div>

      <div class="historico-actions">
        <button
          class="btn btn-light btn-sm"
          data-acao="editar-consulta"
          data-id="${agendamento.id}"
          data-data="${agendamento.data}"
          data-horario="${agendamento.horario}"
        >
          Alterar data e horário
        </button>
      </div>

      ${!podeEditar
        ? '<p class="message-box error">Alterações com menos de 2 dias devem ser feitas por telefone.</p>'
        : ''
      }
    </article>
  `;
}


// abrir e fechar modal
function abrirModalConsulta(dados) {
  agendamentoConsultaAtualId = Number(dados.id);

  inputEditarConsultaData.value = dados.data;
  inputEditarConsultaHorario.value = dados.horario;

  mostrarMensagemEdicaoConsulta('', null);
  modalEditarConsulta.classList.remove('hidden');
}

function fecharModalConsulta() {
  modalEditarConsulta.classList.add('hidden');
  agendamentoConsultaAtualId = null;
}


// adicionar eventos nos botões de editar
function adicionarEventosEditarConsulta() {
  const botoesEditar = document.querySelectorAll('[data-acao="editar-consulta"]');

  botoesEditar.forEach(botao => {
    botao.addEventListener('click', () => {
      const dataAgendamento = botao.dataset.data;

      if (!podeEditarAgendamento(dataAgendamento)) {
        mostrarMensagemConsulta('Esse agendamento só pode ser alterado com pelo menos 2 dias de antecedência.', 'error');
        return;
      }

      mostrarMensagemConsulta('', null);

      abrirModalConsulta({
        id: botao.dataset.id,
        data: botao.dataset.data,
        horario: botao.dataset.horario
      });
    });
  });
}


// consultar
async function consultarAgendamentos() {
  const email = inputConsultaEmail.value.trim();

  if (!email) {
    mostrarMensagemConsulta('Preencha seu e-mail para consultar.', 'error');
    return;
  }

  mostrarMensagemConsulta('', null);
  listaConsulta.innerHTML = '<p>Buscando agendamentos...</p>';

  const agendamentos = await buscarAgendamentosPorEmail(email);

  if (!agendamentos.length) {
    listaConsulta.innerHTML = '<p>Nenhum agendamento encontrado para esse e-mail.</p>';
    return;
  }

  listaConsulta.innerHTML = '';

  for (const agendamento of agendamentos) {
    const servicos = await buscarServicosDoAgendamento(agendamento.id);
    listaConsulta.innerHTML += montarCardAgendamento(agendamento, servicos);
  }

  adicionarEventosEditarConsulta();
}


// salvar edição pública
async function salvarEdicaoConsulta() {
  if (!agendamentoConsultaAtualId) return;

  const novaData = inputEditarConsultaData.value;
  const novoHorario = inputEditarConsultaHorario.value.trim();

  if (!novaData || !novoHorario) {
    mostrarMensagemEdicaoConsulta('Preencha a nova data e o novo horário.', 'error');
    return;
  }

  const podeEditar = podeEditarAgendamento(novaData);

  if (!podeEditar) {
    mostrarMensagemEdicaoConsulta('A nova data escolhida precisa respeitar a regra mínima de 2 dias.', 'error');
    return;
  }

  const atualizou = await atualizarDataHorarioAgendamento(agendamentoConsultaAtualId, {
    data: novaData,
    horario: novoHorario
  });

  if (!atualizou) {
    mostrarMensagemEdicaoConsulta('Erro ao salvar alteração.', 'error');
    return;
  }

  mostrarMensagemEdicaoConsulta('Agendamento alterado com sucesso!', 'success');

  setTimeout(() => {
    fecharModalConsulta();
    consultarAgendamentos();
  }, 800);
}


// eventos
if (botaoConsultar) {
  botaoConsultar.addEventListener('click', consultarAgendamentos);
}

if (botaoFecharModalConsulta) {
  botaoFecharModalConsulta.addEventListener('click', fecharModalConsulta);
}

if (botaoSalvarEdicaoConsulta) {
  botaoSalvarEdicaoConsulta.addEventListener('click', salvarEdicaoConsulta);
}