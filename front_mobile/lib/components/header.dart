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
                    TextButton(
                      onPressed: () =>
                          Navigator.of(context).pushNamed('/descobrir'),
                      style: TextButton.styleFrom(
                        minimumSize: Size.zero,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Campanhas',
                        style: TextStyle(
                          color: Color(0xFF027ba1),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () =>
                          Navigator.of(context).pushNamed('/login'),
                      style: TextButton.styleFrom(
                        minimumSize: Size.zero,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Criar',
                        style: TextStyle(
                          color: Color(0xFF027ba1),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () =>
                          Navigator.of(context).pushNamed('/login'),
                      style: TextButton.styleFrom(
                        minimumSize: Size.zero,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Login',
                        style: TextStyle(
                          color: Color(0xFF027ba1),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
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
