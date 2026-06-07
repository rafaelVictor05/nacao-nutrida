import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../config/api.dart';

class CadastroCampanhaForm extends StatefulWidget {
  const CadastroCampanhaForm({super.key});

  @override
  State<CadastroCampanhaForm> createState() => _CadastroCampanhaFormState();
}

class _CadastroCampanhaFormState extends State<CadastroCampanhaForm> {
  final _tituloCtrl = TextEditingController();
  final _descricaoCtrl = TextEditingController();

  // Estado/Cidade
  List<Map<String, dynamic>> _estadosCidades = [];
  String? _selectedEstado;
  List<String> _cidadesDoEstado = [];
  String? _selectedCidade;

  // Data de encerramento
  DateTime? _dataEncerramento;

  // Alimentos da API: lista de categorias com seus alimentos
  List<Map<String, dynamic>> _categorias = [];

  // Itens de alimento selecionados no formulário
  final List<_AlimentoItem> _alimentos = [];

  bool _loading = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _alimentos.add(_AlimentoItem());
    _fetchInitialData();
  }

  Future<void> _fetchInitialData() async {
    final api = ApiService(baseUrl: ApiConfig.baseUrl);
    try {
      final results = await Future.wait([
        api.get('/estadosCidades'),
        api.get('/alimentos'),
      ]);

      final estadosResp = results[0];
      final alimentosResp = results[1];

      if (estadosResp.statusCode == 200) {
        final data = jsonDecode(utf8.decode(estadosResp.bodyBytes)) as List;
        setState(() {
          _estadosCidades = data.cast<Map<String, dynamic>>();
        });
      }

      if (alimentosResp.statusCode == 200) {
        final data = jsonDecode(utf8.decode(alimentosResp.bodyBytes)) as List;
        setState(() {
          _categorias = data.cast<Map<String, dynamic>>();
        });
      }
    } catch (_) {}

    setState(() => _loading = false);
  }

  void _onEstadoChanged(String? estado) {
    setState(() {
      _selectedEstado = estado;
      _selectedCidade = null;
      _cidadesDoEstado = [];
      if (estado != null) {
        final found = _estadosCidades.firstWhere(
          (e) => (e['sg_estado'] ?? e['sigla'])?.toString() == estado,
          orElse: () => {},
        );
        final cidades = found['cidades'];
        if (cidades is List) {
          _cidadesDoEstado = cidades.map((c) => c.toString()).toList();
        }
      }
    });
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 7)),
      firstDate: now,
      lastDate: DateTime(now.year + 5),
    );
    if (picked != null) setState(() => _dataEncerramento = picked);
  }

  Future<void> _criarCampanha() async {
    // Validações
    if (_tituloCtrl.text.trim().isEmpty) {
      _showError('O campo de nome da campanha é obrigatório');
      return;
    }
    if (_dataEncerramento == null) {
      _showError('O campo de data de encerramento é obrigatório');
      return;
    }
    if (_selectedEstado == null) {
      _showError('O Estado de entrega é obrigatório');
      return;
    }
    if (_selectedCidade == null) {
      _showError('A Cidade de entrega é obrigatória');
      return;
    }
    for (final a in _alimentos) {
      if (a.alimentoId == null || a.quantidade == null || a.quantidade! <= 0) {
        _showError('Todos os campos de alimento devem ser preenchidos');
        return;
      }
    }

    setState(() => _submitting = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId') ?? '';
      if (userId.isEmpty) {
        _showError('Faça login para criar uma campanha');
        setState(() => _submitting = false);
        return;
      }

      final api = ApiService(baseUrl: ApiConfig.baseUrl);

      final dtStr =
          '${_dataEncerramento!.year}-${_dataEncerramento!.month.toString().padLeft(2, '0')}-${_dataEncerramento!.day.toString().padLeft(2, '0')}';

      final payload = {
        'infos_campanha': {
          'usuario_id': userId,
          'nm_titulo_campanha': _tituloCtrl.text.trim(),
          'dt_encerramento_campanha': dtStr,
          'nm_cidade_campanha': _selectedCidade,
          'sg_estado_campanha': _selectedEstado,
          'ds_acao_campanha': _descricaoCtrl.text.trim(),
          'cd_imagem_campanha': '1.png',
          'fg_campanha_ativa': _dataEncerramento!.isAfter(DateTime.now()),
        },
        'alimentos_campanha': _alimentos.map((a) => {
          'id': a.alimentoId,
          'qt_alimento_meta': a.quantidade,
        }).toList(),
      };

      final resp = await api.post('/campanhas', payload);

      if (!mounted) return;
      if (resp.statusCode == 201 || resp.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Campanha criada com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pushNamed('/descobrir-campanha');
      } else {
        _showError('Erro ao criar campanha (${resp.statusCode})');
      }
    } catch (e) {
      _showError('Erro: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Cadastrar campanha',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF191929),
              ),
            ),
            const SizedBox(height: 20),

            // ── Dados iniciais ──────────────────────────────────────────────
            _sectionTitle('Dados iniciais'),
            const SizedBox(height: 12),
            _fieldLabel('Título'),
            TextFormField(
              controller: _tituloCtrl,
              maxLength: 30,
              autofocus: true,
              textInputAction: TextInputAction.next,
              keyboardType: TextInputType.text,
              decoration: const InputDecoration(
                hintText: 'Sopão para moradores de rua',
                counterText: '',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
            const SizedBox(height: 14),
            _fieldLabel('Data de encerramento'),
            InkWell(
              onTap: _pickDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  suffixIcon: Icon(Icons.calendar_today, size: 18),
                ),
                child: Text(
                  _dataEncerramento == null
                      ? 'Selecione a data'
                      : '${_dataEncerramento!.day.toString().padLeft(2, '0')}/${_dataEncerramento!.month.toString().padLeft(2, '0')}/${_dataEncerramento!.year}',
                  style: TextStyle(
                    color: _dataEncerramento == null ? Colors.grey : Colors.black87,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // ── Local de entrega ────────────────────────────────────────────
            _sectionTitle('Local de entrega do alimento'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _fieldLabel('Estado'),
                      DropdownButtonFormField<String>(
                        key: ValueKey(_selectedEstado),
                        isExpanded: true,
                        initialValue: _selectedEstado,
                        hint: const Text('Selecione o Estado'),
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                        items: _estadosCidades.map((e) {
                          final sg = (e['sg_estado'] ?? e['sigla'])?.toString() ?? '';
                          return DropdownMenuItem(value: sg, child: Text(sg));
                        }).toList(),
                        onChanged: _onEstadoChanged,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _fieldLabel('Cidade'),
                      DropdownButtonFormField<String>(
                        key: ValueKey(_selectedCidade),
                        isExpanded: true,
                        initialValue: _selectedCidade,
                        hint: const Text('Selecione a Cidade'),
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                        items: _cidadesDoEstado
                            .map((c) => DropdownMenuItem(value: c, child: Text(c, overflow: TextOverflow.ellipsis)))
                            .toList(),
                        onChanged: _cidadesDoEstado.isEmpty
                            ? null
                            : (v) => setState(() => _selectedCidade = v),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // ── Alimentos ───────────────────────────────────────────────────
            _sectionTitle('Alimentos'),
            const SizedBox(height: 12),
            ..._alimentos.asMap().entries.map((entry) {
              final idx = entry.key;
              final item = entry.value;
              return _AlimentoRow(
                key: ValueKey(item),
                item: item,
                categorias: _categorias,
                showDelete: _alimentos.length > 1,
                onDelete: () => setState(() => _alimentos.removeAt(idx)),
                onChanged: () => setState(() {}),
              );
            }),
            if (_alimentos.length < 10)
              TextButton.icon(
                onPressed: () => setState(() => _alimentos.add(_AlimentoItem())),
                icon: const Icon(Icons.add),
                label: const Text('Adicionar mais um alimento'),
              ),
            const SizedBox(height: 20),

            // ── Dados finais ────────────────────────────────────────────────
            _sectionTitle('Dados finais'),
            const SizedBox(height: 12),
            _fieldLabel('Adicionar descrição da sua ação social'),
            TextFormField(
              controller: _descricaoCtrl,
              maxLines: 5,
              textInputAction: TextInputAction.done,
              keyboardType: TextInputType.multiline,
              decoration: const InputDecoration(
                hintText:
                    'Insira a relevância por trás da sua campanha, descrevendo-a com detalhes.',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _submitting ? null : _criarCampanha,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF064789),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _submitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Cadastrar campanha',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) => Text(
        text,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.bold,
          color: Color(0xFF191929),
        ),
      );

  Widget _fieldLabel(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF191929))),
      );
}

// ─── Modelo de item de alimento ────────────────────────────────────────────────

class _AlimentoItem {
  String? categoriaId;
  String? alimentoId;
  int? quantidade;
  String medida = '';
}

// ─── Widget de linha de alimento ───────────────────────────────────────────────

class _AlimentoRow extends StatefulWidget {
  final _AlimentoItem item;
  final List<Map<String, dynamic>> categorias;
  final bool showDelete;
  final VoidCallback onDelete;
  final VoidCallback onChanged;

  const _AlimentoRow({
    super.key,
    required this.item,
    required this.categorias,
    required this.showDelete,
    required this.onDelete,
    required this.onChanged,
  });

  @override
  State<_AlimentoRow> createState() => _AlimentoRowState();
}

class _AlimentoRowState extends State<_AlimentoRow> {
  List<Map<String, dynamic>> _alimentos = [];

  @override
  void initState() {
    super.initState();
    _refreshAlimentos();
  }

  void _refreshAlimentos() {
    if (widget.item.categoriaId != null) {
      final cat = widget.categorias.firstWhere(
        (c) => c['cd_tipo_alimento']?.toString() == widget.item.categoriaId,
        orElse: () => {},
      );
      final list = cat['alimentos'];
      if (list is List) {
        final sorted = list.cast<Map<String, dynamic>>().toList()
          ..sort((a, b) =>
              (a['nm_alimento'] ?? '').compareTo(b['nm_alimento'] ?? ''));
        _alimentos = sorted;
      } else {
        _alimentos = [];
      }
    } else {
      _alimentos = [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Tipo / Categoria
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tipo', style: TextStyle(fontSize: 13)),
                  const SizedBox(height: 4),
                  DropdownButtonFormField<String>(
                    key: ValueKey(widget.item.categoriaId),
                    isExpanded: true,
                    initialValue: widget.item.categoriaId,
                    hint: const Text('Selecione um tipo'),
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: widget.categorias.map((c) {
                      final id = c['cd_tipo_alimento']?.toString() ?? '';
                      final nome = c['nm_tipo_alimento']?.toString() ?? '';
                      return DropdownMenuItem(value: id, child: Text(nome));
                    }).toList(),
                    onChanged: (v) {
                      setState(() {
                        widget.item.categoriaId = v;
                        widget.item.alimentoId = null;
                        widget.item.medida = '';
                        _refreshAlimentos();
                      });
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Alimento
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Alimento', style: TextStyle(fontSize: 13)),
                  const SizedBox(height: 4),
                  DropdownButtonFormField<String>(
                    key: ValueKey(widget.item.alimentoId),
                    isExpanded: true,
                    initialValue: widget.item.alimentoId,
                    hint: const Text('Selecione'),
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: _alimentos.map((a) {
                      final id = a['id']?.toString() ?? '';
                      final nome = a['nm_alimento']?.toString() ?? '';
                      return DropdownMenuItem(value: id, child: Text(nome, overflow: TextOverflow.ellipsis));
                    }).toList(),
                    onChanged: _alimentos.isEmpty
                        ? null
                        : (v) {
                            setState(() {
                              widget.item.alimentoId = v;
                              final found = _alimentos.firstWhere(
                                (a) => a['id']?.toString() == v,
                                orElse: () => {},
                              );
                              widget.item.medida =
                                  found['sg_medida_alimento']?.toString() ?? '';
                            });
                            widget.onChanged();
                          },
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Quantidade + unidade + botão remover
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Quantidade', style: TextStyle(fontSize: 13)),
                  const SizedBox(height: 4),
                  TextFormField(
                    keyboardType: TextInputType.numberWithOptions(signed: false, decimal: false),
                    textInputAction: TextInputAction.done,
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      suffixText: widget.item.medida,
                    ),
                    onChanged: (v) {
                      widget.item.quantidade = int.tryParse(v);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            if (widget.showDelete) ...[
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: IconButton(
                  onPressed: widget.onDelete,
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  tooltip: 'Remover',
                ),
              ),
            ],
          ],
        ),

        const Divider(height: 24),
      ],
    );
  }
}
