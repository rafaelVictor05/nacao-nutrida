import 'package:flutter/material.dart';

class Header extends StatelessWidget {
  final String? leftText;
  final String rightText;
  final String rightButtonText;
  final VoidCallback? onRightButtonPressed;
  final bool showLogo;
  final VoidCallback? onBack;

  const Header({
    super.key,
    this.leftText,
    required this.rightText,
    required this.rightButtonText,
    this.onRightButtonPressed,
    this.showLogo = true,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

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
                if (onBack != null)
                  IconButton(
                    onPressed: onBack,
                    icon: const Icon(
                      Icons.arrow_back,
                      color: Color(0xFF027ba1),
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    visualDensity: VisualDensity.compact,
                  ),
                if (showLogo)
                  GestureDetector(
                    onTap: () => Navigator.of(context).pushNamed('/'),
                    child: Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: _buildLogoWithText(leftText),
                    ),
                  ),
                const Spacer(),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    _HeaderLink(
                      label: 'Descobrir',
                      onTap: () =>
                          Navigator.of(context).pushNamed('/descobrir-campanha'),
                    ),
                    const SizedBox(width: 12),
                    _HeaderLink(
                      label: 'Criar',
                      onTap: () =>
                          Navigator.of(context).pushNamed('/login'),
                    ),
                    const SizedBox(width: 12),
                    _HeaderLink(
                      label: 'Login',
                      onTap: onRightButtonPressed ??
                          () => Navigator.of(context).pushNamed('/login'),
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

  Widget _buildLogoWithText(String? text) {

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset('assets/logo.png', width: 32, height: 32),
        if (text != null) ...[
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              color: Color(0xFF191929),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
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
