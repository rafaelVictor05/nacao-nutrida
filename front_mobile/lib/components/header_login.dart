import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HeaderLogin extends StatelessWidget implements PreferredSizeWidget {
  final bool showBack;
  final VoidCallback? onBack;

  /// Use [asAppBar] = true quando passado como appBar: do Scaffold
  /// (SafeArea já é gerenciado pelo Flutter nesse caso).
  final bool asAppBar;

  const HeaderLogin({
    super.key,
    this.showBack = false,
    this.onBack,
    this.asAppBar = false,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  void _showSobreNos(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Container(
            padding: const EdgeInsets.all(24),
            width: 500,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Sobre nós',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF027ba1),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'O projeto Nação Nutrida nasceu para conectar pessoas, ONGs e empresas em prol do combate à fome e à insegurança alimentar no Brasil. Nosso objetivo é facilitar doações, promover campanhas solidárias e criar uma rede de apoio que transforma vidas.\n\n'
                  'Aqui, você pode criar campanhas, doar alimentos, acompanhar o progresso das ações e conversar diretamente com quem está fazendo a diferença. Junte-se a nós e faça parte dessa corrente do bem!',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 15, color: Colors.black87),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF027ba1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 12,
                    ),
                  ),
                  child: const Text(
                    'Fechar',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Logout realizado com sucesso.'),
        backgroundColor: Colors.green,
        duration: Duration(seconds: 2),
      ),
    );
    Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    final topPadding =
        asAppBar ? 0.0 : MediaQuery.of(context).padding.top;

    return ColoredBox(
      color: Colors.white,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(height: topPadding),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                if (showBack)
                  IconButton(
                    icon: const Icon(Icons.arrow_back,
                        color: Color(0xFF027ba1)),
                    onPressed: onBack ?? () => Navigator.of(context).pop(),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    visualDensity: VisualDensity.compact,
                  ),
                GestureDetector(
                  onTap: () => Navigator.of(context).pushNamed('/'),
                  child: Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Image.asset('assets/logo.png',
                        width: 36, height: 36),
                  ),
                ),
                const Spacer(),
                _HeaderLink(
                  label: 'Descobrir',
                  onTap: () => Navigator.of(context)
                      .pushNamed('/descobrir-campanha'),
                ),
                const SizedBox(width: 12),
                _HeaderLink(
                  label: 'Criar',
                  onTap: () => Navigator.of(context)
                      .pushNamed('/cadastrar-campanha'),
                ),
                const SizedBox(width: 12),
                _HeaderLink(
                  label: 'Sobre nós',
                  onTap: () => _showSobreNos(context),
                ),
                const SizedBox(width: 16),
                PopupMenuButton<int>(
                  tooltip: 'Conta',
                  offset: const Offset(0, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 1, child: Text('Painel')),
                    const PopupMenuItem(value: 2, child: Text('Chat')),
                    const PopupMenuItem(value: 3, child: Text('Meus dados')),
                    const PopupMenuDivider(),
                    const PopupMenuItem(
                      value: 99,
                      child: Text('Logout',
                          style: TextStyle(color: Colors.red)),
                    ),
                  ],
                  onSelected: (v) {
                    switch (v) {
                      case 1:
                        Navigator.of(context).pushNamed('/painel');
                        break;
                      case 2:
                        Navigator.of(context).pushNamed('/chat');
                        break;
                      case 3:
                        Navigator.of(context).pushNamed('/perfil');
                        break;
                      case 99:
                        _logout(context);
                        break;
                    }
                  },
                  child: const Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: Colors.black12,
                        child: Icon(Icons.person, color: Colors.black54),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.expand_more, color: Colors.black54),
                    ],
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

class _HeaderLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _HeaderLink({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Text(
        label,
        style: const TextStyle(fontSize: 14, color: Colors.black87),
      ),
    );
  }
}
