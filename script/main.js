// guarda o que o usuário escolheu
const estado = {
  servicos: [],
  horario: null,
  data: null
};

// pega elementos principais
const resumo = document.querySelector('.summary-box');
const botaoConfirmar = document.querySelector('#btn-confirmar');
const mensagem = document.querySelector('#mensagem-agendamento');

// campos do formulário
const inputNome = document.querySelector('#nome');
const inputTelefone = document.querySelector('#telefone');
const inputEmail = document.querySelector('#email');

// sugestão de mesma semana
const boxSugestaoSemana = document.querySelector('#sugestao-semana');
const textoSugestaoSemana = document.querySelector('#sugestao-texto');
const botaoUsarDataSugerida = document.querySelector('#btn-usar-data-sugerida');

let sugestaoSemanaAtual = null;


// serviços
const servicosInputs = document.querySelectorAll('input[name="servico"]');

servicosInputs.forEach(input => {
  input.addEventListener('change', () => {
    estado.servicos = Array.from(servicosInputs)
      .filter(el => el.checked)
      .map(el => el.value);

    atualizarResumo();
  });
});


// horários
const botoesHorario = document.querySelectorAll('.hour-btn');

botoesHorario.forEach(btn => {
  btn.addEventListener('click', () => {
    // não deixa clicar em horário desabilitado
    if (btn.classList.contains('is-disabled')) return;

    botoesHorario.forEach(b => b.classList.remove('is-selected'));

    btn.classList.add('is-selected');

    estado.horario = btn.textContent.trim();

    atualizarResumo();
  });
});


// data
const inputData = document.querySelector('input[type="date"]');

// não deixa escolher data passada
if (inputData) {
  const hoje = new Date().toISOString().split('T')[0];
  inputData.min = hoje;

  inputData.addEventListener('change', async (e) => {
    estado.data = e.target.value;

    await atualizarHorariosDisponiveis();
    await verificarSugestaoMesmaSemana();
    atualizarResumo();
  });
}


// email
if (inputEmail) {
  inputEmail.addEventListener('blur', async () => {
    await verificarSugestaoMesmaSemana();
  });
}


// resumo
function atualizarResumo() {
  if (!resumo) return;

  resumo.innerHTML = `
    <p><strong>Serviços:</strong> ${
      estado.servicos.length ? estado.servicos.join(', ') : 'Nenhum selecionado'
    }</p>
    <p><strong>Data:</strong> ${
      estado.data || 'Não escolhida'
    }</p>
    <p><strong>Horário:</strong> ${
      estado.horario || 'Não escolhido'
    }</p>
  `;
}


// bloquear horários passados e ocupados
async function atualizarHorariosDisponiveis() {
  if (!inputData) return;

  const hoje = new Date().toISOString().split('T')[0];
  const dataSelecionada = inputData.value;

  const agora = new Date();
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  let horariosOcupados = [];

  // busca horários já usados no banco
  if (dataSelecionada) {
    horariosOcupados = await buscarHorariosOcupados(dataSelecionada);
  }

  botoesHorario.forEach(btn => {
    const horarioTexto = btn.textContent.trim();
    const [horaBtn, minutoBtn] = horarioTexto.split(':').map(Number);

    btn.classList.remove('is-disabled');

    let desabilitar = false;

    // se for hoje, bloqueia horários que já passaram
    if (dataSelecionada === hoje) {
      const horarioJaPassou =
        horaBtn < horaAtual ||
        (horaBtn === horaAtual && minutoBtn <= minutoAtual);

      if (horarioJaPassou) {
        desabilitar = true;
      }
    }

    // bloqueia horários que já estão ocupados
    if (horariosOcupados.includes(horarioTexto)) {
      desabilitar = true;
    }

    if (desabilitar) {
      btn.classList.add('is-disabled');

      // se o horário selecionado ficou inválido, limpa ele
      if (estado.horario === horarioTexto) {
        estado.horario = null;
      }
    }
  });

  atualizarResumo();
}


// sugestão da mesma semana
async function verificarSugestaoMesmaSemana() {
  if (!inputEmail || !inputData || !boxSugestaoSemana || !textoSugestaoSemana) return;

  const email = inputEmail.value.trim();
  const dataSelecionada = inputData.value;

  sugestaoSemanaAtual = null;
  boxSugestaoSemana.classList.add('hidden');
  textoSugestaoSemana.textContent = '';

  if (!email || !dataSelecionada) return;

  const agendamento = await buscarAgendamentoMesmaSemana(email, dataSelecionada);

  if (!agendamento) return;

  // não sugere se a data encontrada já for a mesma que a pessoa escolheu
  if (agendamento.data === dataSelecionada) return;

  sugestaoSemanaAtual = agendamento;

  textoSugestaoSemana.textContent =
    `Você já possui um agendamento nesta semana em ${agendamento.data} às ${agendamento.horario}. Deseja usar essa mesma data?`;

  boxSugestaoSemana.classList.remove('hidden');
}


// botão da sugestão
if (botaoUsarDataSugerida) {
  botaoUsarDataSugerida.addEventListener('click', async () => {
    if (!sugestaoSemanaAtual || !inputData) return;

    inputData.value = sugestaoSemanaAtual.data;
    estado.data = sugestaoSemanaAtual.data;

    boxSugestaoSemana.classList.add('hidden');

    await atualizarHorariosDisponiveis();
    atualizarResumo();
  });
}


// validar
function validarFormulario() {
  const nome = inputNome.value.trim();
  const telefone = inputTelefone.value.trim();
  const email = inputEmail.value.trim();

  if (estado.servicos.length === 0) {
    mostrarMensagem('Escolha pelo menos um serviço.', 'error');
    return false;
  }

  if (!estado.data) {
    mostrarMensagem('Escolha uma data.', 'error');
    return false;
  }

  if (!estado.horario) {
    mostrarMensagem('Escolha um horário.', 'error');
    return false;
  }

  const agora = new Date();

  if (estado.data) {
    const dataSelecionada = new Date(`${estado.data}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada < hoje) {
      mostrarMensagem('Não é possível agendar em uma data que já passou.', 'error');
      return false;
    }
  }

  if (estado.data && estado.horario) {
    const dataHoraSelecionada = new Date(`${estado.data}T${estado.horario}:00`);

    if (dataHoraSelecionada < agora) {
      mostrarMensagem('Não é possível agendar em um horário que já passou.', 'error');
      return false;
    }
  }

  if (!nome) {
    mostrarMensagem('Preencha seu nome.', 'error');
    return false;
  }

  if (!telefone) {
    mostrarMensagem('Preencha seu telefone.', 'error');
    return false;
  }

  if (!email) {
    mostrarMensagem('Preencha seu e-mail.', 'error');
    return false;
  }

  return true;
}


// mensagem
function mostrarMensagem(texto, tipo) {
  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.classList.remove('success', 'error');

  if (tipo) {
    mensagem.classList.add(tipo);
  }
}


// confirmar
if (botaoConfirmar) {
  botaoConfirmar.addEventListener('click', async () => {
    const valido = validarFormulario();

    if (!valido) return;

    const dadosAgendamento = {
      servicos: estado.servicos,
      data: estado.data,
      horario: estado.horario,
      nome: inputNome.value.trim(),
      telefone: inputTelefone.value.trim(),
      email: inputEmail.value.trim()
    };

    const salvou = await salvarNoBanco(dadosAgendamento);

    if (!salvou) {
      mostrarMensagem('Erro ao salvar agendamento.', 'error');
      return;
    }

    mostrarMensagem('Agendamento confirmado com sucesso!', 'success');

    console.log('Agendamento:', dadosAgendamento);

    // limpa formulário
    inputNome.value = '';
    inputTelefone.value = '';
    inputEmail.value = '';

    estado.servicos = [];
    estado.horario = null;
    estado.data = null;

    sugestaoSemanaAtual = null;

    servicosInputs.forEach(el => {
      el.checked = false;
    });

    botoesHorario.forEach(b => {
      b.classList.remove('is-selected');
      b.classList.remove('is-disabled');
    });

    inputData.value = '';

    if (boxSugestaoSemana) {
      boxSugestaoSemana.classList.add('hidden');
    }

    atualizarResumo();
  });
}


// organiza os horários quando a página carrega
atualizarHorariosDisponiveis();