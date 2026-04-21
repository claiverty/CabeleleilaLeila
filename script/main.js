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
    botoesHorario.forEach(b => b.classList.remove('is-selected'));

    btn.classList.add('is-selected');

    estado.horario = btn.textContent.trim();

    atualizarResumo();
  });
});


// data

const inputData = document.querySelector('input[type="date"]');

if (inputData) {
  inputData.addEventListener('change', (e) => {
    estado.data = e.target.value;

    atualizarResumo();
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
  mensagem.classList.add(tipo);
}


// confirmar

if (botaoConfirmar) {
  botaoConfirmar.addEventListener('click', () => {
    const valido = validarFormulario();

    if (!valido) return;

    // guarda os dados antes de limpar
    const dadosAgendamento = {
      servicos: estado.servicos,
      data: estado.data,
      horario: estado.horario,
      nome: inputNome.value.trim(),
      telefone: inputTelefone.value.trim(),
      email: inputEmail.value.trim()
    };

    mostrarMensagem('Agendamento confirmado com sucesso!', 'success');

    console.log('Agendamento:', dadosAgendamento);

    // limpa formulário depois de confirmar
    inputNome.value = '';
    inputTelefone.value = '';
    inputEmail.value = '';

    estado.servicos = [];
    estado.horario = null;
    estado.data = null;

    // desmarca checkboxes
    servicosInputs.forEach(el => el.checked = false);

    // remove seleção de horário
    botoesHorario.forEach(b => b.classList.remove('is-selected'));

    // limpa data
    inputData.value = '';

    atualizarResumo();
  });
}

