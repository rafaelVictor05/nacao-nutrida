import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../components/header.dart';
import '../components/header_login.dart';
import '../components/footer.dart';
import '../components/pagina_inicial.dart';
import '../models/auth_manager.dart';

class PaginaInicial extends StatefulWidget {
  const PaginaInicial({super.key});

  @override
  State<PaginaInicial> createState() => _PaginaInicialState();
}

class _PaginaInicialState extends State<PaginaInicial> {
  @override
  Widget build(BuildContext context) {
    final isLoggedIn = Provider.of<AuthManager>(context).isLoggedIn;

    return Scaffold(
      backgroundColor: const Color(0xFFf6f6f6),
      body: SingleChildScrollView(
        child: Column(
          children: [
            if (isLoggedIn)
              const HeaderLogin()
            else
              Header(
                rightText: '',
                rightButtonText: 'Login',
                onRightButtonPressed: () {
                  Navigator.of(context).pushNamed('/login');
                },
              ),
            const SizedBox.shrink(),
            Padding(padding: const EdgeInsets.all(24), child: LeftSidebar()),
            const Footer(),
          ],
        ),
      ),
    );
  }
}
