import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../components/header_login.dart';
import '../config/api.dart';

// ---------------------------------------------------------------------------
// Modelos
// ---------------------------------------------------------------------------

class Conversation {
  final String id;
  final List<String> users;
  final String lastMessage;
  final String updatedAt;

  Conversation({
    required this.id,
    required this.users,
    this.lastMessage = '',
    this.updatedAt = '',
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id']?.toString() ?? '',
      users: List<String>.from(
          (json['users'] ?? []).map((u) => u.toString())),
      lastMessage: json['lastMessage']?.toString() ?? '',
      updatedAt: json['updatedAt']?.toString() ?? '',
    );
  }
}

class ChatMessage {
  final String id;
  final String senderId;
  final String text;
  final String time;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    this.time = '',
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      time: json['time']?.toString() ?? json['createdAt']?.toString() ?? '',
    );
  }
}

// ---------------------------------------------------------------------------
// Tela principal de Chat
// ---------------------------------------------------------------------------

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  List<Conversation> _conversations = [];
  Conversation? _selected;
  List<ChatMessage> _messages = [];
  final Map<String, String> _userNames = {};
  final TextEditingController _textCtrl = TextEditingController();

  String _userId = '';
  String _adminId = 'admin';
  bool _loadingConversations = false;
  bool _loadingMessages = false;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userId = prefs.getString('userId') ?? '';
      _adminId = prefs.getString('adminId') ?? 'admin';
    });
    if (_userId.isNotEmpty) {
      await _fetchConversations();
    }
  }

  Future<Map<String, String>> _authHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null) {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
    }
    return {'Content-Type': 'application/json'};
  }

  Future<void> _fetchConversations() async {
    if (_userId.isEmpty) return;
    setState(() => _loadingConversations = true);
    try {
      final headers = await _authHeaders();
      final uri = Uri.parse(
          '${ApiConfig.baseUrl}/chat/conversations?userId=$_userId');
      final res = await http
          .get(uri, headers: headers)
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        final convs = data.map((j) => Conversation.fromJson(j)).toList();
        setState(() => _conversations = convs);
        for (final conv in convs) {
          await _fetchOtherUserName(conv);
        }
      }
    } catch (_) {
    } finally {
      setState(() => _loadingConversations = false);
    }
  }

  Future<void> _fetchOtherUserName(Conversation conv) async {
    final otherId = _otherUserId(conv);
    if (otherId.isEmpty || _userNames.containsKey(otherId)) return;
    try {
      final headers = await _authHeaders();
      final uri = Uri.parse('${ApiConfig.baseUrl}/usuario/nome/$otherId');
      final res = await http
          .get(uri, headers: headers)
          .timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final nome = data['nome']?.toString() ?? otherId;
        setState(() => _userNames[otherId] = nome);
      }
    } catch (_) {}
  }

  String _otherUserId(Conversation conv) {
    return conv.users.firstWhere(
      (id) => id != _userId,
      orElse: () => '',
    );
  }

  String _displayName(Conversation conv) {
    final otherId = _otherUserId(conv);
    final name = _userNames[otherId] ?? otherId;
    if (name.toLowerCase() == 'admin' || otherId == _adminId) {
      return 'Nação Nutrida';
    }
    return name.isNotEmpty ? name : 'Usuário';
  }

  Future<void> _selectConversation(Conversation conv) async {
    setState(() {
      _selected = conv;
      _messages = [];
      _loadingMessages = true;
    });
    await _fetchMessages(conv.id);
  }

  Future<void> _fetchMessages(String conversationId) async {
    try {
      final headers = await _authHeaders();
      final uri = Uri.parse(
          '${ApiConfig.baseUrl}/chat/messages?conversationId=$conversationId&userId=$_userId');
      final res = await http
          .get(uri, headers: headers)
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        setState(() {
          _messages = data.map((j) => ChatMessage.fromJson(j)).toList();
        });
      }
    } catch (_) {
    } finally {
      setState(() => _loadingMessages = false);
    }
  }

  Future<void> _sendMessage(String text) async {
    if (_selected == null || text.trim().isEmpty) return;
    try {
      final headers = await _authHeaders();
      final uri = Uri.parse('${ApiConfig.baseUrl}/chat/messages');
      final res = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode({
              'conversationId': _selected!.id,
              'senderId': _userId,
              'text': text.trim(),
            }),
          )
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final msg = ChatMessage.fromJson(jsonDecode(res.body));
        setState(() => _messages.add(msg));
      }
    } catch (_) {}
  }

  Future<void> _startChat() async {
    if (_userId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Faça login para iniciar uma conversa.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    try {
      final headers = await _authHeaders();
      final uri = Uri.parse('${ApiConfig.baseUrl}/chat/conversations');
      final res = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode({
              'userId': _userId,
              'adminId': _adminId,
            }),
          )
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final conv = Conversation.fromJson(jsonDecode(res.body));
        setState(() => _conversations.add(conv));
        await _fetchOtherUserName(conv);
        await _selectConversation(conv);
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erro ao iniciar conversa.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _deleteConversation(Conversation conv) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir conversa'),
        content: const Text('Tem certeza que deseja excluir este chat?'),
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
    if (confirm != true) return;
    try {
      final headers = await _authHeaders();
      final uri = Uri.parse(
          '${ApiConfig.baseUrl}/chat/conversations/${conv.id}?userId=$_userId');
      await http
          .delete(uri, headers: headers)
          .timeout(const Duration(seconds: 10));
      setState(() {
        _conversations.removeWhere((c) => c.id == conv.id);
        if (_selected?.id == conv.id) {
          _selected = null;
          _messages = [];
        }
      });
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erro ao excluir conversa.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _selected == null
          ? _buildConversationList()
          : _buildChatWindow(),
    );
  }

  // ---------------------------------------------------------------------------
  // Lista de conversas
  // ---------------------------------------------------------------------------

  Widget _buildConversationList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const HeaderLogin(showBack: true),
        const Padding(
          padding: EdgeInsets.fromLTRB(24, 24, 24, 8),
          child: Text(
            'Conversas',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Color(0xFF027ba1),
            ),
          ),
        ),
        if (_loadingConversations)
          const Expanded(child: Center(child: CircularProgressIndicator()))
        else if (_conversations.isEmpty)
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chat_bubble_outline,
                      size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text(
                    'Nenhuma conversa ainda',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _startChat,
                    icon: const Icon(Icons.add_comment),
                    label: const Text('Iniciar conversa'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF027ba1),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          Expanded(
            child: ListView.separated(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _conversations.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (ctx, i) {
                final conv = _conversations[i];
                final name = _displayName(conv);
                final time = conv.updatedAt.isNotEmpty
                    ? _formatTime(conv.updatedAt)
                    : '';
                return Dismissible(
                  key: Key(conv.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    color: Colors.red,
                    child:
                        const Icon(Icons.delete, color: Colors.white),
                  ),
                  confirmDismiss: (_) async {
                    await _deleteConversation(conv);
                    return false;
                  },
                  child: ListTile(
                    onTap: () => _selectConversation(conv),
                    leading: const CircleAvatar(
                      backgroundColor: Color(0xFF027ba1),
                      child: Icon(Icons.person, color: Colors.white),
                    ),
                    title: Text(
                      name,
                      style:
                          const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: conv.lastMessage.isNotEmpty
                        ? Text(
                            conv.lastMessage,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style:
                                const TextStyle(color: Colors.black54),
                          )
                        : null,
                    trailing: time.isNotEmpty
                        ? Text(time,
                            style: const TextStyle(
                                fontSize: 12, color: Colors.black45))
                        : null,
                  ),
                );
              },
            ),
          ),
        if (_conversations.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _startChat,
                icon: const Icon(Icons.add_comment),
                label: const Text('Nova conversa'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF027ba1),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Janela de mensagens
  // ---------------------------------------------------------------------------

  Widget _buildChatWindow() {
    final otherName = _displayName(_selected!);

    return Column(
      children: [
        // Header da conversa
        Container(
          color: const Color(0xFF027ba1),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: SafeArea(
            bottom: false,
            child: Row(
              children: [
                IconButton(
                  icon:
                      const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => setState(() {
                    _selected = null;
                    _messages = [];
                  }),
                ),
                const CircleAvatar(
                  backgroundColor: Colors.white24,
                  child: Icon(Icons.person, color: Colors.white),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    otherName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Mensagens
        Expanded(
          child: _loadingMessages
              ? const Center(child: CircularProgressIndicator())
              : _messages.isEmpty
                  ? const Center(
                      child: Text(
                        'Nenhuma mensagem ainda',
                        style:
                            TextStyle(color: Colors.grey, fontSize: 15),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      itemCount: _messages.length,
                      itemBuilder: (ctx, i) {
                        final msg = _messages[i];
                        final isSent = msg.senderId == _userId;
                        return _buildMessageBubble(msg, isSent);
                      },
                    ),
        ),

        // Campo de envio
        Container(
          color: Colors.white,
          padding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textCtrl,
                    decoration: InputDecoration(
                      hintText: 'Digite sua mensagem...',
                      filled: true,
                      fillColor: const Color(0xFFF0F2F5),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (v) async {
                      if (v.trim().isNotEmpty) {
                        await _sendMessage(v);
                        _textCtrl.clear();
                      }
                    },
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () async {
                    final txt = _textCtrl.text;
                    if (txt.trim().isNotEmpty) {
                      await _sendMessage(txt);
                      _textCtrl.clear();
                    }
                  },
                  icon: const Icon(Icons.send),
                  color: const Color(0xFF027ba1),
                  iconSize: 28,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMessageBubble(ChatMessage msg, bool isSent) {
    return Align(
      alignment: isSent ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.72,
        ),
        decoration: BoxDecoration(
          color: isSent
              ? const Color(0xFFB3D4FC)
              : const Color(0xFFE8EAF6),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isSent ? 16 : 4),
            bottomRight: Radius.circular(isSent ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment:
              isSent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              msg.text,
              style:
                  const TextStyle(fontSize: 14, color: Colors.black87),
            ),
            if (msg.time.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                _formatTime(msg.time),
                style: const TextStyle(
                    fontSize: 10, color: Colors.black45),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatTime(String raw) {
    try {
      final dt = DateTime.parse(raw).toLocal();
      final h = dt.hour.toString().padLeft(2, '0');
      final m = dt.minute.toString().padLeft(2, '0');
      return '$h:$m';
    } catch (_) {
      return raw;
    }
  }
}
