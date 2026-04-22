// conexão com o supabase
const SUPABASE_URL = 'https://sbdynlzmbhdmtjgkvqea.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZHlubHptYmhkbXRqZ2t2cWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjU0OTcsImV4cCI6MjA5MjQ0MTQ5N30.zxyTcv0WO8FGlGGRayWCuORiFurEVRu4wCRMJFstJhk';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// buscar cliente pelo email
async function buscarClientePorEmail(email) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }

  return data;
}


// criar cliente
async function criarCliente(dados) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .insert([
      {
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar cliente:', error);
    return null;
  }

  return data;
}


// buscar serviços pelo nome
async function buscarServicosPorNome(nomesServicos) {
  const { data, error } = await supabaseClient
    .from('servicos')
    .select('*')
    .in('nome', nomesServicos);

  if (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }

  return data;
}


// criar agendamento
async function criarAgendamento(clienteId, dados) {
  const { data, error } = await supabaseClient
    .from('agendamentos')
    .insert([
      {
        cliente_id: clienteId,
        data: dados.data,
        horario: dados.horario,
        status: 'pendente',
        observacoes: null
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar agendamento:', error);
    return null;
  }

  return data;
}


// salvar serviços do agendamento
async function salvarServicosDoAgendamento(agendamentoId, servicos) {
  const itens = servicos.map(servico => ({
    agendamento_id: agendamentoId,
    servico_id: servico.id,
    status_servico: 'pendente'
  }));

  const { error } = await supabaseClient
    .from('agendamento_servicos')
    .insert(itens);

  if (error) {
    console.error('Erro ao salvar serviços do agendamento:', error);
    return false;
  }

  return true;
}


// salvar fluxo completo
async function salvarNoBanco(dados) {
  let cliente = await buscarClientePorEmail(dados.email);

  if (!cliente) {
    cliente = await criarCliente(dados);
  }

  if (!cliente) return false;

  const servicos = await buscarServicosPorNome(dados.servicos);

  if (!servicos.length) {
    console.error('Nenhum serviço encontrado.');
    return false;
  }

  const agendamento = await criarAgendamento(cliente.id, dados);

  if (!agendamento) return false;

  const salvouServicos = await salvarServicosDoAgendamento(agendamento.id, servicos);

  if (!salvouServicos) return false;

  return true;
}


// buscar histórico com cliente
async function buscarHistorico() {
  const { data, error } = await supabaseClient
    .from('agendamentos')
    .select(`
      id,
      data,
      horario,
      status,
      observacoes,
      created_at,
      clientes (
        nome,
        telefone,
        email
      )
    `)
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }

  return data;
}


// buscar serviços de um agendamento
async function buscarServicosDoAgendamento(agendamentoId) {
  const { data, error } = await supabaseClient
    .from('agendamento_servicos')
    .select(`
      id,
      status_servico,
      servicos (
        id,
        nome,
        preco,
        duracao_minutos
      )
    `)
    .eq('agendamento_id', agendamentoId);

  if (error) {
    console.error('Erro ao buscar serviços do agendamento:', error);
    return [];
  }

  return data;
}


// buscar agendamentos por email
async function buscarAgendamentosPorEmail(email) {
  const { data, error } = await supabaseClient
    .from('agendamentos')
    .select(`
      id,
      data,
      horario,
      status,
      cliente_id
    `)
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao buscar agendamentos por email:', error);
    return [];
  }

  const { data: clientes, error: erroClientes } = await supabaseClient
    .from('clientes')
    .select('id, email')
    .eq('email', email);

  if (erroClientes) {
    console.error('Erro ao buscar cliente por email:', erroClientes);
    return [];
  }

  if (!clientes.length) return [];

  const idsClientes = clientes.map(cliente => cliente.id);

  return data.filter(agendamento => idsClientes.includes(agendamento.cliente_id));
}


// deixa disponível nos outros arquivos
window.salvarNoBanco = salvarNoBanco;
window.buscarHistorico = buscarHistorico;
window.buscarServicosDoAgendamento = buscarServicosDoAgendamento;
window.buscarAgendamentosPorEmail = buscarAgendamentosPorEmail;