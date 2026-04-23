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


// buscar agendamentos com cliente
async function buscarAgendamentosDashboard() {
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
    .order('data', { ascending: true });

  if (error) {
    console.error('Erro ao buscar agendamentos do dashboard:', error);
    return [];
  }

  return data;
}


// atualizar status do agendamento
async function atualizarStatusAgendamento(agendamentoId, novoStatus) {
  const { error } = await supabaseClient
    .from('agendamentos')
    .update({ status: novoStatus })
    .eq('id', agendamentoId);

  if (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    return false;
  }

  return true;
}


// atualizar status dos serviços do agendamento
async function atualizarStatusServicosDoAgendamento(agendamentoId, novoStatus) {
  const { error } = await supabaseClient
    .from('agendamento_servicos')
    .update({ status_servico: novoStatus })
    .eq('agendamento_id', agendamentoId);

  if (error) {
    console.error('Erro ao atualizar status dos serviços:', error);
    return false;
  }

  return true;
}


// filtrar histórico por período
async function buscarHistoricoPorPeriodo(dataInicial, dataFinal) {
  let query = supabaseClient
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

  if (dataInicial) {
    query = query.gte('data', dataInicial);
  }

  if (dataFinal) {
    query = query.lte('data', dataFinal);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao filtrar histórico:', error);
    return [];
  }

  return data;
}


// atualizar dados do agendamento
async function atualizarAgendamento(agendamentoId, dados) {
  const { error } = await supabaseClient
    .from('agendamentos')
    .update({
      data: dados.data,
      horario: dados.horario,
      status: dados.status
    })
    .eq('id', agendamentoId);

  if (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return false;
  }

  return true;
}


// atualizar data e horário do agendamento
async function atualizarDataHorarioAgendamento(agendamentoId, dados) {
  const { error } = await supabaseClient
    .from('agendamentos')
    .update({
      data: dados.data,
      horario: dados.horario
    })
    .eq('id', agendamentoId);

  if (error) {
    console.error('Erro ao atualizar data e horário:', error);
    return false;
  }

  return true;
}


// buscar horários ocupados por data
async function buscarHorariosOcupados(data) {
  const { data: agendamentos, error } = await supabaseClient
    .from('agendamentos')
    .select('horario, status')
    .eq('data', data);

  if (error) {
    console.error('Erro ao buscar horários ocupados:', error);
    return [];
  }

  // ignora cancelados
  return agendamentos
    .filter(item => item.status !== 'cancelado')
    .map(item => item.horario);
}


// buscar agendamento da mesma semana
async function buscarAgendamentoMesmaSemana(email, dataSelecionada) {
  const cliente = await buscarClientePorEmail(email);

  if (!cliente) return null;

  const dataBase = new Date(`${dataSelecionada}T00:00:00`);
  const diaDaSemana = dataBase.getDay();

  // ajusta pra segunda
  const diferencaParaSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;

  const inicioSemana = new Date(dataBase);
  inicioSemana.setDate(dataBase.getDate() + diferencaParaSegunda);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  const inicio = inicioSemana.toISOString().split('T')[0];
  const fim = fimSemana.toISOString().split('T')[0];

  const { data, error } = await supabaseClient
    .from('agendamentos')
    .select('id, data, horario, status')
    .eq('cliente_id', cliente.id)
    .gte('data', inicio)
    .lte('data', fim)
    .neq('status', 'cancelado')
    .order('data', { ascending: true })
    .limit(1);

  if (error) {
    console.error('Erro ao buscar agendamento da mesma semana:', error);
    return null;
  }

  return data.length ? data[0] : null;
}


// buscar métricas da semana
async function buscarMetricasSemana() {
  const hoje = new Date();

  const primeiroDia = new Date(hoje);
  const diaDaSemana = hoje.getDay();
  const diferencaParaSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
  primeiroDia.setDate(hoje.getDate() + diferencaParaSegunda);

  const ultimoDia = new Date(primeiroDia);
  ultimoDia.setDate(primeiroDia.getDate() + 6);

  const dataInicial = primeiroDia.toISOString().split('T')[0];
  const dataFinal = ultimoDia.toISOString().split('T')[0];

  const { data: agendamentos, error } = await supabaseClient
    .from('agendamentos')
    .select('id, status, data')
    .gte('data', dataInicial)
    .lte('data', dataFinal);

  if (error) {
    console.error('Erro ao buscar métricas da semana:', error);
    return null;
  }

  const idsAgendamentos = agendamentos.map(item => item.id);

  let servicosSemana = [];

  if (idsAgendamentos.length) {
    const { data: servicosAgendados, error: erroServicos } = await supabaseClient
      .from('agendamento_servicos')
      .select(`
        id,
        servico_id,
        servicos (
          nome
        )
      `)
      .in('agendamento_id', idsAgendamentos);

    if (erroServicos) {
      console.error('Erro ao buscar serviços da semana:', erroServicos);
      return null;
    }

    servicosSemana = servicosAgendados;
  }

  return {
    total: agendamentos.length,
    pendentes: agendamentos.filter(item => item.status === 'pendente').length,
    confirmados: agendamentos.filter(item => item.status === 'confirmado').length,
    concluidos: agendamentos.filter(item => item.status === 'concluido').length,
    cancelados: agendamentos.filter(item => item.status === 'cancelado').length,
    servicosSemana
  };
}


// login
// faz login com email e senha
async function fazerLogin(email, senha) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    console.error('Erro no login:', error);
    return null;
  }

  return data;
}


// pega sessão atual (usuário logado)
async function pegarSessao() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}


// logout
async function fazerLogout() {
  await supabaseClient.auth.signOut();
}


window.salvarNoBanco = salvarNoBanco;
window.buscarHistorico = buscarHistorico;
window.buscarServicosDoAgendamento = buscarServicosDoAgendamento;
window.buscarAgendamentosPorEmail = buscarAgendamentosPorEmail;
window.buscarAgendamentosDashboard = buscarAgendamentosDashboard;
window.atualizarStatusAgendamento = atualizarStatusAgendamento;
window.atualizarStatusServicosDoAgendamento = atualizarStatusServicosDoAgendamento;
window.buscarHistoricoPorPeriodo = buscarHistoricoPorPeriodo;
window.atualizarAgendamento = atualizarAgendamento;
window.atualizarDataHorarioAgendamento = atualizarDataHorarioAgendamento;
window.buscarHorariosOcupados = buscarHorariosOcupados;
window.buscarAgendamentoMesmaSemana = buscarAgendamentoMesmaSemana;
window.buscarMetricasSemana = buscarMetricasSemana;
window.fazerLogin = fazerLogin;
window.pegarSessao = pegarSessao;
window.fazerLogout = fazerLogout;