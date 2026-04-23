const inputEmail = document.querySelector('#login-email');
const inputSenha = document.querySelector('#login-senha');
const botaoLogin = document.querySelector('#btn-login');
const mensagem = document.querySelector('#mensagem-login');


// mostra mensagem na tela
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.classList.remove('success', 'error');

  if (tipo) {
    mensagem.classList.add(tipo);
  }
}


// login
if (botaoLogin) {
  botaoLogin.addEventListener('click', async () => {
    const email = inputEmail.value.trim();
    const senha = inputSenha.value.trim();

    if (!email || !senha) {
      mostrarMensagem('Preencha email e senha.', 'error');
      return;
    }

    const resultado = await fazerLogin(email, senha);

    if (!resultado) {
      mostrarMensagem('Email ou senha inválidos.', 'error');
      return;
    }

    mostrarMensagem('Login realizado!', 'success');

    // redireciona pro dashboard
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 800);
  });
}