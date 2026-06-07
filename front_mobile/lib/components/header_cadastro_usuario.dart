import 'package:flutter/material.dart';

class HeaderCadastroUsuario extends StatelessWidget {
  final String rightText;
  final String rightButtonText;
  final VoidCallback? onRightButtonPressed;

  const HeaderCadastroUsuario({
    super.key,
    required this.rightText,
    required this.rightButtonText,
    this.onRightButtonPressed,
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back,
                          color: Color(0xFF027ba1)),
                      onPressed: () => Navigator.pop(context),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      visualDensity: VisualDensity.compact,
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () => Navigator.of(context).pushNamed('/'),
                      child: Image.asset('assets/logo.png',
                          width: 32, height: 32),
                    ),
                  ],
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      rightText,
                      style: const TextStyle(
                          color: Color(0xFF8d8d8d), fontSize: 14),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: onRightButtonPressed,
                      style: TextButton.styleFrom(
                        minimumSize: Size.zero,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        rightButtonText,
                        style: const TextStyle(
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
}
