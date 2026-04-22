// conexão com o supabase
const SUPABASE_URL = 'https://sbdynlzmbhdmtjgkvqea.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZHlubHptYmhkbXRqZ2t2cWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjU0OTcsImV4cCI6MjA5MjQ0MTQ5N30.zxyTcv0WO8FGlGGRayWCuORiFurEVRu4wCRMJFstJhk';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// salvar no banco
async function salvarNoBanco(dados) {
  const { error } = await supabaseClient
    .from('agendamentos')
    .insert([
      {
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email,
        servicos: dados.servicos.join(', '),
        data: dados.data,
        horario: dados.horario
      }
    ]);

  if (error) {
    console.error('Erro ao salvar:', error);
    return false;
  }

  return true;
}


// deixa disponível no main.js
window.salvarNoBanco = salvarNoBanco;