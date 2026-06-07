const int _totalImagens = 7;

/// Retorna o asset path (1–7) escolhido deterministicamente pelo ID.
/// Imagens enviadas ao servidor não são bundled no app, por isso ignoramos
/// cdImagem e sempre usamos os banners locais.
String imagemCampanhaAsset(String id, {String? cdImagem}) {
  final digits = id.replaceAll(RegExp(r'\D'), '');
  final seed = int.tryParse(
        digits.length > 6 ? digits.substring(digits.length - 6) : digits,
      ) ??
      1;
  final index = (seed.abs() % _totalImagens) + 1;
  return 'assets/campanhas/$index.png';
}
