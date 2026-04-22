const inputConsultaEmail = document.querySelector('#consulta-email');
const botaoConsultar = document.querySelector('#btn-consultar');
const mensagemConsulta = document.querySelector('#mensagem-consulta');
const listaConsulta = document.querySelector('#consulta-lista');


// mensagem
function mostrarMensagemConsulta(texto, tipo) {
  if (!mensagemConsulta) return;

  mensagemConsulta.textContent = texto;

  mensagemConsulta.classList.remove('success', 'error');

  // só adiciona se tiver valor
  if (tipo) {
    mensagemConsulta.classList.add(tipo);
  }
}


// montar card
function montarCardAgendamento(agendamento, servicos) {
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
    </article>
  `;
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
}



if (botaoConsultar) {
  botaoConsultar.addEventListener('click', consultarAgendamentos);
}