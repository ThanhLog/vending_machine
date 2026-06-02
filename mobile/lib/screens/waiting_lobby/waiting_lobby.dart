import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../bloc/queue/queue_cubit.dart';
import '../../bloc/queue/queue_state.dart';
import '../../config/theme.dart';
import '../purchase/purchase.dart';

class VendingQueueLobby extends StatefulWidget {
  final String machineId, machineName, machineSsid, machinePassword;
  final String? privateKey;

  const VendingQueueLobby({
    super.key,
    required this.machineId,
    required this.machineName,
    this.machineSsid = 'Vending_Setup',
    this.machinePassword = '12345678',
    this.privateKey,
  });

  @override
  State<VendingQueueLobby> createState() => _VendingQueueLobbyState();
}

class _VendingQueueLobbyState extends State<VendingQueueLobby> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _joined = false;

  @override
  void dispose() { _audioPlayer.dispose(); super.dispose(); }

  Future<void> _playNotificationSound() async {
    try { await _audioPlayer.stop(); await _audioPlayer.play(AssetSource('sounds/notification.mp3')); }
    catch (_) {}
  }

  void _joinQueue() {
    if (!mounted) return;
    final pk = widget.privateKey;
    if (pk == null || pk.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login first'), backgroundColor: AppTheme.error));
      return;
    }
    context.read<QueueCubit>().joinQueue(widget.machineId, pk);
    setState(() => _joined = true);
  }

  @override
  Widget build(BuildContext context) {
    final sw = MediaQuery.of(context).size.width;

    return BlocConsumer<QueueCubit, QueueState>(
      listener: (context, state) {
        if (state.isMyTurn && _joined) _playNotificationSound();
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!), backgroundColor: AppTheme.error));
          context.read<QueueCubit>().clearError();
        }
      },
      builder: (context, state) {
        final isMyTurn = state.isMyTurn;
        final qNum = state.queueNumber;

        return Container(
          decoration: const BoxDecoration(gradient: AppTheme.gradDark),
          child: Scaffold(
            backgroundColor: Colors.transparent,
            body: SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // ── HEADER ──
                    Row(children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: AppTheme.textSecondary),
                        onPressed: () { context.read<QueueCubit>().reset(); Navigator.pop(context); },
                      ),
                      const SizedBox(width: 8),
                      Expanded(child: Text(widget.machineName.toUpperCase(),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textSecondary, letterSpacing: 1))),
                      // Status pill
                      GestureDetector(
                        onTap: () { if (isMyTurn) Navigator.push(context, MaterialPageRoute(builder: (_) => Purchase(machineId: widget.machineId, privateKey: widget.privateKey))); },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: isMyTurn ? AppTheme.accent.withOpacity(0.15) : AppTheme.warning.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isMyTurn ? AppTheme.accent : AppTheme.warning, width: 1.5),
                          ),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Container(width: 8, height: 8,
                              decoration: BoxDecoration(shape: BoxShape.circle,
                                  color: isMyTurn ? AppTheme.accent : AppTheme.warning)),
                            const SizedBox(width: 8),
                            Text(isMyTurn ? 'YOUR TURN' : 'IN QUEUE',
                              style: TextStyle(color: isMyTurn ? AppTheme.accent : AppTheme.warning,
                                  fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1)),
                          ]),
                        ),
                      ),
                    ]),

                    // ── CENTER ──
                    if (!_joined && !state.isLoading)
                      _buildJoinPrompt()
                    else if (state.isLoading)
                      const Center(child: CircularProgressIndicator(color: AppTheme.accent))
                    else if (!isMyTurn)
                      _buildWaiting(state, sw)
                    else
                      _buildYourTurn(state, sw),

                    // ── FOOTER ──
                    _buildFooter(state, isMyTurn),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildJoinPrompt() {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 80, height: 80,
        decoration: BoxDecoration(shape: BoxShape.circle,
          gradient: AppTheme.gradAccent,
          boxShadow: AppTheme.glow(AppTheme.accent, blur: 30)),
        child: const Icon(Icons.qr_code_scanner_rounded, size: 40, color: AppTheme.bg),
      ),
      const SizedBox(height: 24),
      const Text('Connect to Machine', style: AppTheme.h2),
      const SizedBox(height: 8),
      const Text('Join virtual queue to purchase', style: AppTheme.body),
      const SizedBox(height: 32),
      SizedBox(width: 220, height: 52,
        child: ElevatedButton.icon(
          onPressed: _joinQueue,
          icon: const Icon(Icons.cable, size: 20),
          label: const Text('JOIN QUEUE', style: TextStyle(fontWeight: FontWeight.w700, letterSpacing: 2, fontSize: 14)),
          style: AppTheme.primaryBtn,
        ),
      ),
    ]);
  }

  Widget _buildWaiting(QueueState state, double sw) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      const Text('YOUR NUMBER', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.accent, letterSpacing: 4)),
      const SizedBox(height: 16),
      Text(state.queueNumber.toString().padLeft(2, '0'),
        style: TextStyle(fontSize: sw > 600 ? 120 : 90, fontWeight: FontWeight.w900, color: Colors.white, height: 1.0)),
      const SizedBox(height: 12),
      Text('${state.peopleAhead} ahead of you', style: AppTheme.body.copyWith(fontSize: 16)),
      Text('~${state.estimatedWaitMin.toStringAsFixed(1)} min wait', style: AppTheme.caption),
      const SizedBox(height: 24),
      SizedBox(width: 200,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: LinearProgressIndicator(
            backgroundColor: AppTheme.cardBorder,
            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accent),
            minHeight: 4,
          ),
        ),
      ),
    ]);
  }

  Widget _buildYourTurn(QueueState state, double sw) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 80, height: 80,
        decoration: BoxDecoration(shape: BoxShape.circle,
          gradient: const LinearGradient(colors: [AppTheme.accent3, AppTheme.accent]),
          boxShadow: AppTheme.glow(AppTheme.accent3, blur: 30)),
        child: const Icon(Icons.check_circle_outline, size: 40, color: AppTheme.bg),
      ),
      const SizedBox(height: 24),
      ShaderMask(
        shaderCallback: (b) => const LinearGradient(colors: [AppTheme.accent3, AppTheme.accent]).createShader(b),
        child: const Text('YOUR TURN!', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 4)),
      ),
      const SizedBox(height: 8),
      Text('NUMBER: ${state.queueNumber.toString().padLeft(2, '0')}', style: AppTheme.body.copyWith(fontSize: 16)),
      const SizedBox(height: 32),
      GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => Purchase(machineId: widget.machineId, privateKey: widget.privateKey))),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
          decoration: BoxDecoration(
            gradient: AppTheme.gradAccent,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppTheme.glow(AppTheme.accent, blur: 25),
          ),
          child: const Text('TAP TO SELECT ITEMS',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.bg, letterSpacing: 2)),
        ),
      ),
    ]);
  }

  Widget _buildFooter(QueueState state, bool isMyTurn) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.cardDecoration(borderColor: AppTheme.cardBorder.withOpacity(0.5)),
      child: isMyTurn
          ? Row(children: [
              Icon(Icons.timer_outlined, color: AppTheme.warning, size: 24),
              const SizedBox(width: 12),
              const Expanded(child: Text('Auto-expires after 2 min', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13))),
            ])
          : Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
              _stat('Position', '#${state.queueNumber}', AppTheme.accent),
              _stat('Ahead', '${state.peopleAhead} ppl', AppTheme.textPrimary),
              _stat('Est.', '~${state.estimatedWaitMin.toStringAsFixed(1)} min', AppTheme.accent3),
            ]),
    );
  }

  Widget _stat(String label, String value, Color color) {
    return Column(children: [
      Text(label, style: AppTheme.caption),
      const SizedBox(height: 4),
      Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: color)),
    ]);
  }
}
