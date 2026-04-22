const listaHistorico = document.querySelector('#historico-lista');
const mensagemHistorico = document.querySelector('#historico-mensagem');


// carregar histórico
async function carregarHistorico() {
  const agendamentos = await buscarHistorico();

  if (!agendamentos.length) {
    listaHistorico.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    return;
  }

  listaHistorico.innerHTML = '';

  for (const agendamento of agendamentos) {
    const servicos = await buscarServicosDoAgendamento(agendamento.id);

    const card = document.createElement('article');
    card.classList.add('historico-card');

    card.innerHTML = `
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
    `;

    listaHistorico.appendChild(card);
  }
}

carregarHistorico();