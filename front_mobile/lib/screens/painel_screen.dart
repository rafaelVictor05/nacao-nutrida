import 'dart:convert';
import 'package:flutter/material.dart';
import '../components/header_login.dart';
import '../config/api.dart';
import '../services/api_service.dart';
import '../utils/campanha_imagem.dart';

class PainelScreen extends StatefulWidget {
  const PainelScreen({super.key});

  @override
  State<PainelScreen> createState() => _PainelScreenState();
}

class _PainelScreenState extends State<PainelScreen> {
  String _aba = 'campanhas';
  bool _loading = true;
  String? _erro;

  List<Map<String, dynamic>> _campanhas = [];
  List<Map<String, dynamic>> _doacoes = [];
  List<String> _recomendacoes = [];

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() {
      _loading = true;
      _erro = null;
    });
    await Future.wait([_fetchCampanhas(), _fetchDoacoes()]);
    setState(() => _loading = false);
  }

  Future<void> _fetchCampanhas() async {
    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      final resp = await api.get('/campanhas/minhas');
      if (resp.statusCode == 200) {
        final List data = jsonDecode(utf8.decode(resp.bodyBytes));
        setState(() => _campanhas = data.cast<Map<String, dynamic>>());
      }
    } catch (_) {}
  }

  Future<void> _fetchDoacoes() async {
    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      final resp = await api.get('/doacoes/minhas');
      if (resp.statusCode == 200) {
        final List data = jsonDecode(utf8.decode(resp.bodyBytes));
        final doacoes = data.cast<Map<String, dynamic>>();
        setState(() => _doacoes = doacoes);
        await _fetchRecomendacoes(doacoes);
      }
    } catch (_) {}
  }

  Future<void> _fetchRecomendacoes(List<Map<String, dynamic>> doacoes) async {
    final alimentosUnicos = <String>{};
    for (final d in doacoes) {
      final alimentos = d['alimentos_doados'] as List? ?? [];
      for (final a in alimentos) {
        final nome = a['alimento']?['nome']?.toString() ?? '';
        if (nome.isNotEmpty) alimentosUnicos.add(nome);
      }
    }
    if (alimentosUnicos.isEmpty) return;

    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      final resp = await api.post(
        '/mineracao/recomendacoes',
        {'alimentos': alimentosUnicos.toList()},
      );
      if (resp.statusCode == 200) {
        final data = jsonDecode(utf8.decode(resp.bodyBytes));
        final lista = data['recomendacoes'] ?? data ?? [];
        final sugeridos = (lista as List)
            .map((r) => (r['alimentoSugerido'] ?? r).toString())
            .toSet();
        setState(() {
          _recomendacoes =
              sugeridos.where((s) => !alimentosUnicos.contains(s)).toList();
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _carregar,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const HeaderLogin(showBack: true),
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Painel',
                            style: TextStyle(
                              color: Colors.blueAccent,
                              fontWeight: FontWeight.bold,
                              fontSize: 22,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Abas
                          Row(
                            children: [
                              _Aba(
                                label: 'Minhas campanhas',
                                ativo: _aba == 'campanhas',
                                onTap: () =>
                                    setState(() => _aba = 'campanhas'),
                              ),
                              const SizedBox(width: 8),
                              _Aba(
                                label: 'Minhas doações',
                                ativo: _aba == 'doacoes',
                                onTap: () =>
                                    setState(() => _aba = 'doacoes'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          if (_erro != null)
                            Text(_erro!,
                                style:
                                    const TextStyle(color: Colors.red))
                          else if (_aba == 'campanhas')
                            _buildCampanhas()
                          else
                            _buildDoacoes(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildCampanhas() {
    if (_campanhas.isEmpty) {
      return const _Empty(
        icon: Icons.campaign_outlined,
        mensagem: 'Você ainda não criou nenhuma campanha.',
      );
    }
    return Column(
      children: _campanhas
          .map((c) => _CampanhaCard(
                campanha: c,
                onExcluida: () =>
                    setState(() => _campanhas.remove(c)),
              ))
          .toList(),
    );
  }

  Widget _buildDoacoes() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_recomendacoes.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFE3F2FD),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1976D2), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Recomendado para você',
                  style: TextStyle(
                    color: Color(0xFF1976D2),
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Com base nas suas doações anteriores, considere também doar:',
                  style: TextStyle(fontSize: 13, color: Colors.black87),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: _recomendacoes
                      .map(
                        (a) => Chip(
                          label: Text(
                            a,
                            style: const TextStyle(
                                color: Colors.white, fontSize: 13),
                          ),
                          backgroundColor: const Color(0xFF1976D2),
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () =>
                      Navigator.of(context).pushNamed('/descobrir-campanha'),
                  child: const Text(
                    'Encontrar campanhas →',
                    style: TextStyle(
                      color: Color(0xFF1976D2),
                      fontWeight: FontWeight.w600,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
        if (_doacoes.isEmpty)
          const _Empty(
            icon: Icons.volunteer_activism_outlined,
            mensagem: 'Você ainda não realizou nenhuma doação.',
          )
        else
          Column(
            children: _doacoes.map((d) => _DoacaoCard(doacao: d)).toList(),
          ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Widgets auxiliares
// ---------------------------------------------------------------------------

class _Aba extends StatelessWidget {
  final String label;
  final bool ativo;
  final VoidCallback onTap;

  const _Aba(
      {required this.label, required this.ativo, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: ativo ? const Color(0xFF027ba1) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF027ba1)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: ativo ? Colors.white : const Color(0xFF027ba1),
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  final IconData icon;
  final String mensagem;
  const _Empty({required this.icon, required this.mensagem});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Icon(icon, size: 56, color: Colors.grey[400]),
            const SizedBox(height: 12),
            Text(mensagem,
                textAlign: TextAlign.center,
                style:
                    const TextStyle(color: Colors.grey, fontSize: 15)),
          ],
        ),
      ),
    );
  }
}

class _CampanhaCard extends StatelessWidget {
  final Map<String, dynamic> campanha;
  final VoidCallback? onExcluida;
  const _CampanhaCard({required this.campanha, this.onExcluida});

  void _abrirModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _GerenciarModal(
        campanha: campanha,
        onExcluida: onExcluida,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final id = campanha['id']?.toString() ?? '';
    final titulo = campanha['nm_titulo_campanha']?.toString() ?? '';
    final cidade = campanha['nm_cidade_campanha']?.toString() ?? '';
    final estado = campanha['sg_estado_campanha']?.toString() ?? '';
    final ativa = campanha['fg_campanha_ativa'] == true;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 120,
            width: double.infinity,
            child: Image.asset(
              imagemCampanhaAsset(id),
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: Colors.grey[200],
                child: const Icon(Icons.image_not_supported,
                    size: 48, color: Colors.grey),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        titulo,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color:
                            ativa ? Colors.green[100] : Colors.red[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        ativa ? 'Ativa' : 'Encerrada',
                        style: TextStyle(
                          color:
                              ativa ? Colors.green[800] : Colors.red[800],
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '$cidade, $estado',
                  style: const TextStyle(
                      fontSize: 13, color: Colors.black54),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _abrirModal(context),
                    icon: const Icon(Icons.settings_outlined, size: 16),
                    label: const Text('Gerenciar campanha'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF027ba1),
                      side: const BorderSide(color: Color(0xFF027ba1)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DoacaoCard extends StatelessWidget {
  final Map<String, dynamic> doacao;
  const _DoacaoCard({required this.doacao});

  @override
  Widget build(BuildContext context) {
    final campanha = doacao['campanha'] as Map<String, dynamic>? ?? {};
    final nome = campanha['nome']?.toString() ?? '';
    final cidade = campanha['cidade']?.toString() ?? '';
    final estado = campanha['estado']?.toString() ?? '';
    final alimentos =
        (doacao['alimentos_doados'] as List? ?? []).cast<Map<String, dynamic>>();

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.volunteer_activism,
                    color: Color(0xFF027ba1), size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    nome,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '$cidade, $estado',
              style:
                  const TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 10),
            const Text(
              'Alimentos doados:',
              style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87),
            ),
            const SizedBox(height: 6),
            Column(
              children: alimentos.map((a) {
                final nomeAlimento =
                    a['alimento']?['nome']?.toString() ?? '';
                final sgMedida =
                    a['alimento']?['sg_medida']?.toString() ?? '';
                final quantidade = a['quantidade'] ?? 0;
                final unidade =
                    sgMedida.isNotEmpty ? ' $sgMedida' : ' un.';
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    children: [
                      const Icon(Icons.circle,
                          size: 6, color: Colors.black45),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          nomeAlimento,
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                      Text(
                        '$quantidade$unidade',
                        style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF027ba1)),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Modal de gerenciamento de campanha
// ---------------------------------------------------------------------------

class _GerenciarModal extends StatefulWidget {
  final Map<String, dynamic> campanha;
  final VoidCallback? onExcluida;

  const _GerenciarModal({required this.campanha, this.onExcluida});

  @override
  State<_GerenciarModal> createState() => _GerenciarModalState();
}

class _GerenciarModalState extends State<_GerenciarModal> {
  bool _loadingDoacoes = true;
  bool _excluindo = false;
  List<Map<String, dynamic>> _doacoes = [];

  @override
  void initState() {
    super.initState();
    _fetchDoacoes();
  }

  Future<void> _fetchDoacoes() async {
    final id = widget.campanha['id']?.toString() ?? '';
    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      final resp = await api.get('/campanhas/$id/doacoes');
      if (resp.statusCode == 200) {
        final List data = jsonDecode(utf8.decode(resp.bodyBytes));
        setState(() => _doacoes = data.cast<Map<String, dynamic>>());
      }
    } catch (_) {
    } finally {
      setState(() => _loadingDoacoes = false);
    }
  }

  Future<void> _excluir() async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir campanha'),
        content: const Text(
            'Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Excluir',
                style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmar != true) return;

    setState(() => _excluindo = true);
    final id = widget.campanha['id']?.toString() ?? '';
    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      await api.patch('/campanhas/desativar/$id');
      if (mounted) {
        Navigator.of(context).pop();
        widget.onExcluida?.call();
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erro ao excluir campanha.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _excluindo = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final campanha = widget.campanha;
    final id = campanha['id']?.toString() ?? '';
    final titulo = campanha['nm_titulo_campanha']?.toString() ?? '';
    final descricao = campanha['ds_acao_campanha']?.toString() ?? '';
    final cidade = campanha['nm_cidade_campanha']?.toString() ?? '';
    final estado = campanha['sg_estado_campanha']?.toString() ?? '';
    final alimentos =
        (campanha['alimentos'] as List? ?? []).cast<Map<String, dynamic>>();

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      builder: (_, scrollCtrl) => SingleChildScrollView(
        controller: scrollCtrl,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(titulo,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.asset(
                  imagemCampanhaAsset(id),
                  height: 130,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 130,
                    color: Colors.grey[200],
                    child: const Icon(Icons.image_not_supported,
                        size: 40, color: Colors.grey),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              if (descricao.isNotEmpty) ...[
                Text(descricao,
                    style: const TextStyle(
                        fontSize: 13, color: Colors.black87)),
                const SizedBox(height: 8),
              ],
              Text('$cidade, $estado',
                  style: const TextStyle(
                      fontSize: 13, color: Colors.black54)),
              if (alimentos.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: alimentos.map((a) {
                    final nome = a['nm_alimento']?.toString() ?? '';
                    return Chip(
                      label: Text(nome,
                          style: const TextStyle(fontSize: 12)),
                      backgroundColor: const Color(0xFFE3F2FD),
                      padding: EdgeInsets.zero,
                      visualDensity: VisualDensity.compact,
                    );
                  }).toList(),
                ),
              ],
              const Divider(height: 28),
              const Text('Doações nesta campanha',
                  style: TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 8),
              if (_loadingDoacoes)
                const Center(child: CircularProgressIndicator())
              else if (_doacoes.isEmpty)
                const Text('Nenhuma doação registrada.',
                    style: TextStyle(color: Colors.grey))
              else
                Column(
                  children: _doacoes.map((d) {
                    final doador =
                        d['doador']?['nome']?.toString() ?? 'Doador';
                    final alimento =
                        d['alimento']?['nome']?.toString() ?? '';
                    final qtd = d['quantidade_doada'] ?? 0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.person_outline,
                              size: 16, color: Colors.black54),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text('$doador — $alimento ($qtd)',
                                style: const TextStyle(fontSize: 13)),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _excluindo ? null : _excluir,
                  icon: _excluindo
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.delete_outline),
                  label: Text(
                      _excluindo ? 'Excluindo...' : 'Excluir campanha'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
