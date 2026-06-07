import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../components/header_login.dart';
import '../components/header.dart';
import '../components/footer.dart';
import '../models/auth_manager.dart';
import '../services/api_service.dart';
import '../config/api.dart';
import '../utils/campanha_imagem.dart';

class _AlimentoCampanha {
  final String alimentoId;
  final String nome;
  final String unidade;
  final int meta;
  final int doado;

  _AlimentoCampanha({
    required this.alimentoId,
    required this.nome,
    required this.unidade,
    required this.meta,
    required this.doado,
  });

  double get percentual => meta > 0 ? (doado / meta).clamp(0.0, 1.0) : 0;
  int get percentualInt => (percentual * 100).floor();
}

class _CampanhaDetalhe {
  final String id;
  final String titulo;
  final String descricao;
  final String? imageUrl;
  final String nomeUsuario;
  final String cidade;
  final String estado;
  final int anosRestantes;
  final int mesesRestantes;
  final int diasRestantes;
  final int horasRestantes;
  final int minutosRestantes;
  final List<_AlimentoCampanha> alimentos;

  _CampanhaDetalhe({
    required this.id,
    required this.titulo,
    required this.descricao,
    this.imageUrl,
    required this.nomeUsuario,
    required this.cidade,
    required this.estado,
    required this.anosRestantes,
    required this.mesesRestantes,
    required this.diasRestantes,
    required this.horasRestantes,
    required this.minutosRestantes,
    required this.alimentos,
  });

  String get tempoRestante {
    if (anosRestantes > 0) return 'Expira em: $anosRestantes anos';
    if (mesesRestantes > 0) return 'Expira em: $mesesRestantes meses';
    if (diasRestantes > 0) return 'Expira em: $diasRestantes dias';
    if (horasRestantes > 0) return 'Expira em: $horasRestantes horas';
    if (minutosRestantes > 0) return 'Expira em: $minutosRestantes minutos';
    return 'Campanha encerrada';
  }
}

class DetalhesCampanhaPage extends StatefulWidget {
  final String campanhaId;

  const DetalhesCampanhaPage({super.key, required this.campanhaId});

  @override
  State<DetalhesCampanhaPage> createState() => _DetalhesCampanhaPageState();
}

class _DetalhesCampanhaPageState extends State<DetalhesCampanhaPage> {
  late final ApiService _api;
  _CampanhaDetalhe? _campanha;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _api = ApiService(baseUrl: ApiConfig.baseUrl);
    _fetchCampanha();
  }

  Future<void> _fetchCampanha() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = await _api.get('/campanhas/${widget.campanhaId}');
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        setState(() {
          _campanha = _mapToCampanha(data);
        });
      } else {
        setState(() {
          _error = 'Erro ao carregar campanha: ${resp.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Falha de rede: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  _CampanhaDetalhe _mapToCampanha(Map<String, dynamic> json) {
    int toInt(dynamic v) => (v as num?)?.toInt() ?? 0;

    final alimentosRaw = json['alimentos'] as List<dynamic>? ?? [];
    final alimentos = alimentosRaw.map((a) {
      return _AlimentoCampanha(
        alimentoId: (a['alimento_id'] ?? a['id'] ?? '').toString(),
        nome: (a['nm_alimento'] ?? '').toString(),
        unidade: (a['sg_medida_alimento'] ?? 'un').toString(),
        meta: toInt(a['qt_alimento_meta']),
        doado: toInt(a['qt_alimento_doado']),
      );
    }).toList();

    return _CampanhaDetalhe(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      titulo: (json['nm_titulo_campanha'] ?? '').toString(),
      descricao: (json['ds_acao_campanha'] ?? '').toString(),
      imageUrl: json['cd_imagem_campanha'] as String?,
      nomeUsuario: (json['nm_usuario'] ?? '').toString(),
      cidade: (json['nm_cidade_campanha'] ?? '').toString(),
      estado: (json['sg_estado_campanha'] ?? '').toString(),
      anosRestantes: toInt(json['anos_restantes']),
      mesesRestantes: toInt(json['meses_restantes']),
      diasRestantes: toInt(json['dias_restantes']),
      horasRestantes: toInt(json['horas_restantes']),
      minutosRestantes: toInt(json['minutos_restantes']),
      alimentos: alimentos,
    );
  }

  void _abrirModalDoacao() {
    final authManager = Provider.of<AuthManager>(context, listen: false);
    if (!authManager.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Faça login para realizar uma doação.'),
          action: SnackBarAction(
            label: 'Login',
            onPressed: () => Navigator.of(context).pushNamed('/login'),
          ),
        ),
      );
      return;
    }
    if (_campanha == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _DoacaoBottomSheet(
        campanha: _campanha!,
        onDoacaoRealizada: _fetchCampanha,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoggedIn = Provider.of<AuthManager>(context).isLoggedIn;

    return Scaffold(
      backgroundColor: const Color(0xFFf6f6f6),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isLoggedIn)
              HeaderLogin(
                showBack: true,
                onBack: () => Navigator.pop(context),
              )
            else
              Header(
                rightText: 'Já tem conta?',
                rightButtonText: 'Entrar',
                onRightButtonPressed: () =>
                    Navigator.of(context).pushNamed('/login'),
                onBack: () => Navigator.pop(context),
              ),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              Padding(
                padding: const EdgeInsets.all(24),
                child: Center(child: Text(_error!)),
              )
            else if (_campanha != null)
              _buildConteudo(),
            const Footer(),
          ],
        ),
      ),
    );
  }

  Widget _buildConteudo() {
    final c = _campanha!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildImagem(c),
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                c.titulo,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF191929),
                ),
              ),
              const SizedBox(height: 16),
              _buildInfoCriador(c),
              const SizedBox(height: 20),
              _buildDescricao(c),
              const SizedBox(height: 20),
              _buildAlimentos(c),
              const SizedBox(height: 24),
              _buildBotaoDoar(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildImagem(_CampanhaDetalhe c) {
    final asset = imagemCampanhaAsset(c.id);
    return SizedBox(
      width: double.infinity,
      height: 220,
      child: Image.asset(
        asset,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          width: double.infinity,
          height: 220,
          color: const Color(0xFFDCE5F0),
          child: const Icon(Icons.campaign, size: 64, color: Color(0xFF7da3cc)),
        ),
      ),
    );
  }

  Widget _buildInfoCriador(_CampanhaDetalhe c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0xFF027ba1),
            child: Text(
              c.nomeUsuario.isNotEmpty ? c.nomeUsuario[0].toUpperCase() : '?',
              style: const TextStyle(color: Colors.white, fontSize: 20),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  c.nomeUsuario,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_pin, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      '${c.cidade}, ${c.estado}',
                      style: const TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      c.tempoRestante,
                      style: const TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDescricao(_CampanhaDetalhe c) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Descrição',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF027ba1),
            ),
          ),
          const SizedBox(height: 8),
          Text(c.descricao, style: const TextStyle(fontSize: 14, height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildAlimentos(_CampanhaDetalhe c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Alimentos',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF191929),
            ),
          ),
          const SizedBox(height: 16),
          ...c.alimentos.map((a) => _buildItemAlimento(a)),
        ],
      ),
    );
  }

  Widget _buildItemAlimento(_AlimentoCampanha a) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            a.nome,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: a.percentual,
              minHeight: 8,
              backgroundColor: const Color(0xFFDCE5F0),
              valueColor: AlwaysStoppedAnimation<Color>(
                a.percentual >= 1.0 ? Colors.green : const Color(0xFF027ba1),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Arrecadado: ${a.doado} ${a.unidade}',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              Text(
                'Meta: ${a.meta} ${a.unidade}',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              Text(
                '${a.percentualInt}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: a.percentual >= 1.0
                      ? Colors.green
                      : const Color(0xFF027ba1),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBotaoDoar() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _abrirModalDoacao,
        icon: const Icon(Icons.volunteer_activism),
        label: const Text('Doar', style: TextStyle(fontSize: 16)),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF027ba1),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Bottom Sheet de Doação
// ─────────────────────────────────────────────────────────
class _DoacaoBottomSheet extends StatefulWidget {
  final _CampanhaDetalhe campanha;
  final VoidCallback onDoacaoRealizada;

  const _DoacaoBottomSheet({
    required this.campanha,
    required this.onDoacaoRealizada,
  });

  @override
  State<_DoacaoBottomSheet> createState() => _DoacaoBottomSheetState();
}

class _DoacaoBottomSheetState extends State<_DoacaoBottomSheet> {
  late final List<TextEditingController> _controllers;
  List<String> _recomendacoes = [];
  bool _enviando = false;
  bool _loadingRec = false;

  @override
  void initState() {
    super.initState();
    _controllers = widget.campanha.alimentos
        .map((_) => TextEditingController())
        .toList();
    _fetchRecomendacoes();
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _fetchRecomendacoes() async {
    setState(() => _loadingRec = true);
    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      final nomes = widget.campanha.alimentos.map((a) => a.nome).toList();
      final resp = await api.post('/mineracao/recomendacoes', {'alimentos': nomes});
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body);
        final lista = data['recomendacoes'] ?? data ?? [];
        setState(() {
          _recomendacoes = (lista as List)
              .map((r) => (r['alimentoSugerido'] ?? r).toString())
              .toList();
        });
      }
    } catch (_) {
      // silencia: recomendações são opcionais
    } finally {
      if (mounted) setState(() => _loadingRec = false);
    }
  }

  Future<void> _enviarDoacao() async {
    final authManager = Provider.of<AuthManager>(context, listen: false);

    final alimentosDoacao = <Map<String, dynamic>>[];
    for (int i = 0; i < widget.campanha.alimentos.length; i++) {
      final qty = int.tryParse(_controllers[i].text) ?? 0;
      if (qty > 0) {
        alimentosDoacao.add({
          'alimento_id': widget.campanha.alimentos[i].alimentoId,
          'qt_alimento_doacao': qty,
        });
      }
    }

    if (alimentosDoacao.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor, doe ao menos um alimento.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Tenta obter userId do AuthManager; se não tiver, busca do perfil
    String? usuarioId = authManager.userId;
    if (usuarioId == null || usuarioId == 'unknown') {
      final api = ApiService(baseUrl: ApiConfig.baseUrl);
      try {
        final perfilResp = await api.get('/usuario/perfil');
        if (perfilResp.statusCode == 200) {
          final perfil = jsonDecode(perfilResp.body);
          usuarioId = (perfil['_id'] ?? perfil['id'])?.toString();
        }
      } catch (_) {}
    }

    if (usuarioId == null || usuarioId.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não foi possível identificar o usuário. Faça login novamente.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _enviando = true);
    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      final payload = {
        'infos_doacao': {
          'usuario_doacao': usuarioId,
          'cd_campanha_doacao': widget.campanha.id,
        },
        'alimentos_doacao': alimentosDoacao,
      };

      final resp = await api.post('/doacoes', payload);
      if (!mounted) return;

      if (resp.statusCode == 201 || resp.statusCode == 200) {
        // Captura referências antes do pop para uso posterior
        final messenger = ScaffoldMessenger.of(context);
        final navigator = Navigator.of(context);

        // Verifica campanha completa ANTES de fechar o modal
        bool campanhaCompleta = false;
        try {
          final campanhaResp = await api.get('/campanhas/${widget.campanha.id}');
          if (campanhaResp.statusCode == 200) {
            final data = jsonDecode(campanhaResp.body);
            final alimentos = (data['alimentos'] as List<dynamic>?) ?? [];
            campanhaCompleta = alimentos.isNotEmpty &&
                alimentos.every((a) =>
                    (a['qt_alimento_doado'] as num? ?? 0) >=
                    (a['qt_alimento_meta'] as num? ?? 1));
            if (campanhaCompleta) {
              await api.patch('/campanhas/desativar/${widget.campanha.id}');
            }
          }
        } catch (_) {}

        if (!mounted) return;

        // Fecha o modal
        navigator.pop();

        if (campanhaCompleta) {
          // Mesma mensagem e duração do toast do web
          messenger.showSnackBar(
            const SnackBar(
              content: Row(
                children: [
                  Text('🎉', style: TextStyle(fontSize: 20)),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Sua doação completou a campanha! Muito obrigado por fazer a diferença!',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 7),
              behavior: SnackBarBehavior.floating,
              margin: EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
            ),
          );
          navigator.popUntil((r) => r.isFirst);
        } else {
          messenger.showSnackBar(
            const SnackBar(
              content: Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.white),
                  SizedBox(width: 10),
                  Text(
                    'Doação realizada com sucesso!',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 4),
              behavior: SnackBarBehavior.floating,
              margin: EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
            ),
          );
          // Atualiza os dados da campanha imediatamente
          widget.onDoacaoRealizada();
        }
      } else if (resp.statusCode == 401) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Você precisa estar logado para fazer uma doação.'),
            backgroundColor: Colors.red,
          ),
        );
        Navigator.of(context).pushNamed('/login');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao fazer doação: ${resp.statusCode}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Falha de rede: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final alimentos = widget.campanha.alimentos;

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (ctx, scrollCtrl) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle + título
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Column(
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Informe a quantidade da doação:',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF191929),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Divider(),
                ],
              ),
            ),
            // Conteúdo scrollável
            Expanded(
              child: ListView(
                controller: scrollCtrl,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  // Cabeçalho da tabela
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: const [
                        Expanded(
                          flex: 3,
                          child: Text(
                            'Alimento',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Text(
                            'Quantidade',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Linha por alimento
                  ...List.generate(alimentos.length, (i) {
                    final a = alimentos[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Container(
                              height: 44,
                              alignment: Alignment.centerLeft,
                              padding: const EdgeInsets.symmetric(horizontal: 10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF5F5F5),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                a.nome,
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 2,
                            child: Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _controllers[i],
                                    keyboardType: TextInputType.number,
                                    textAlign: TextAlign.center,
                                    decoration: InputDecoration(
                                      hintText: '0',
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                              vertical: 10),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      isDense: true,
                                    ),
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  a.unidade,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                  // Recomendações
                  if (_loadingRec)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      ),
                    )
                  else if (_recomendacoes.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE3F2FD),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF1976D2)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Quem doou estes alimentos também doou:',
                            style: TextStyle(
                              color: Color(0xFF1976D2),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: _recomendacoes
                                .map(
                                  (r) => Chip(
                                    label: Text(
                                      r,
                                      style: const TextStyle(
                                          color: Colors.white, fontSize: 12),
                                    ),
                                    backgroundColor: const Color(0xFF1976D2),
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 4),
                                  ),
                                )
                                .toList(),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 16),
                ],
              ),
            ),
            // Botão enviar
            Padding(
              padding: EdgeInsets.fromLTRB(
                16,
                8,
                16,
                MediaQuery.of(context).padding.bottom + 16,
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _enviando ? null : _enviarDoacao,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF027ba1),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _enviando
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text('Enviar', style: TextStyle(fontSize: 16)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
