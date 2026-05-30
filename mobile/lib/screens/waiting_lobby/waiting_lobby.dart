import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../bloc/queue/queue_cubit.dart';
import '../../bloc/queue/queue_state.dart';
import '../../services/wifi_service.dart';
import '../purchase/purchase.dart';

class VendingQueueLobby extends StatefulWidget {
  final String machineId;
  final String machineName;
  final String machineSsid;
  final String machinePassword;
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
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _playNotificationSound() async {
    try {
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      debugPrint('Sound error: $e');
    }
  }

  void _joinQueue() async {
    // Join queue via cloud API - phone uses its own internet (4G/WiFi)
    // ESP32 proximity is verified via GPS, not WiFi connection
    if (!mounted) return;

    // Check login status before joining queue
    final privateKey = widget.privateKey;
    if (privateKey == null || privateKey.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please login first to join the queue'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final queueCubit = context.read<QueueCubit>();
    queueCubit.joinQueue(widget.machineId, privateKey);
    setState(() => _joined = true);
  }

  void _showWifiDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.wifi_off, color: Colors.redAccent),
            SizedBox(width: 12),
            Text('WiFi Required',
                style: TextStyle(color: Colors.white, fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Please connect to the vending machine WiFi:',
              style: TextStyle(color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                borderRadius: BorderRadius.all(Radius.circular(8)),
              ),
              child: Column(
                children: [
                  Text(
                    widget.machineSsid,
                    style: const TextStyle(
                      color: Colors.cyanAccent,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                  if (widget.machinePassword.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Password: ${widget.machinePassword}',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Open your WiFi settings, connect to the machine, then try again.',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _joinQueue();
            },
            child: const Text('Try Again',
                style: TextStyle(color: Colors.cyanAccent)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return BlocConsumer<QueueCubit, QueueState>(
      listener: (context, state) {
        // Play sound when it becomes our turn
        if (state.isMyTurn && _joined) {
          _playNotificationSound();
        }
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!), backgroundColor: Colors.red),
          );
          context.read<QueueCubit>().clearError();
        }
      },
      builder: (context, state) {
        final isMyTurn = state.isMyTurn;
        final queueNumber = state.queueNumber;

        return Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // ── HEADER ──────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            IconButton(
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 32),
                              onPressed: () {
                                context.read<QueueCubit>().reset();
                                Navigator.pop(context);
                              },
                              icon: const Icon(Icons.arrow_back, color: Color(0xFF94A3B8), size: 24),
                            ),
                            Expanded(
                              child: Text(
                                widget.machineName.toUpperCase(),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF94A3B8),
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Status tag
                      GestureDetector(
                        onTap: () {
                          if (isMyTurn) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => Purchase(
                                  machineId: widget.machineId,
                                  privateKey: widget.privateKey,
                                ),
                              ),
                            );
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: isMyTurn
                                ? Colors.redAccent.withOpacity(0.14)
                                : Colors.amber.withOpacity(0.14),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isMyTurn ? Colors.redAccent : Colors.amberAccent,
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircleAvatar(
                                radius: 4,
                                backgroundColor: isMyTurn ? Colors.redAccent : Colors.amberAccent,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                isMyTurn ? 'YOUR TURN' : 'IN QUEUE',
                                style: TextStyle(
                                  color: isMyTurn ? Colors.redAccent : Colors.amberAccent,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  // ── CENTER CONTENT ──────────────────
                  if (!_joined && !state.isLoading)
                    // Not joined yet
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.qr_code_scanner_rounded, size: 80, color: Colors.cyanAccent),
                        const SizedBox(height: 24),
                        const Text(
                          'Connect to Machine',
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'You will be placed in a virtual queue.',
                          style: TextStyle(color: Color(0xFF94A3B8)),
                        ),
                        const SizedBox(height: 32),
                        ElevatedButton.icon(
                          onPressed: _joinQueue,
                          icon: const Icon(Icons.cable),
                          label: const Text('Join Queue'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.cyanAccent,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                          ),
                        ),
                      ],
                    )
                  else if (state.isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (!isMyTurn)
                    // Waiting in queue
                    Column(
                      children: [
                        const Text(
                          'YOUR QUEUE NUMBER',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.cyanAccent,
                            letterSpacing: 3,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          queueNumber.toString().padLeft(2, '0'),
                          style: TextStyle(
                            fontSize: screenWidth > 600 ? 140 : 100,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            height: 1.0,
                          ),
                        ),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: 240,
                          child: LinearProgressIndicator(
                            backgroundColor: Colors.white10,
                            valueColor: const AlwaysStoppedAnimation<Color>(Colors.cyanAccent),
                            minHeight: 6,
                          ),
                        ),
                      ],
                    )
                  else
                    // It's our turn
                    Column(
                      children: [
                        const Icon(Icons.check_circle_outline_rounded, size: 80, color: Colors.redAccent),
                        const SizedBox(height: 16),
                        const Text(
                          'IT\'S YOUR TURN!',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.redAccent,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'QUEUE NUMBER: ${queueNumber.toString().padLeft(2, '0')}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                        const SizedBox(height: 32),
                        InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => Purchase(
                                  machineId: widget.machineId,
                                  privateKey: widget.privateKey,
                                ),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                            decoration: BoxDecoration(
                              color: Colors.redAccent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.redAccent.withOpacity(0.3),
                                  blurRadius: 20,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Text(
                              'TAP TO SELECT ITEMS',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                  // ── FOOTER ──────────────────────────
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: !isMyTurn
                        ? Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _buildStatusItem('Your Position', '#$queueNumber', Colors.amberAccent),
                                  Container(width: 1, height: 35, color: Colors.white10),
                                  _buildStatusItem('Ahead of You', '${state.peopleAhead} people', Colors.white),
                                  Container(width: 1, height: 35, color: Colors.white10),
                                  _buildStatusItem('Est. Wait', '~${state.estimatedWaitMin.toStringAsFixed(1)} min', Colors.tealAccent),
                                ],
                              ),
                              const Divider(height: 40, color: Colors.white10, thickness: 1),
                              const Row(
                                children: [
                                  Icon(Icons.qr_code_scanner_rounded, color: Color(0xFF94A3B8), size: 24),
                                  SizedBox(width: 16),
                                  Expanded(
                                    child: Text(
                                      'Scan QR code on the machine to track your queue number directly on your phone.',
                                      style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8), height: 1.4),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          )
                        : Row(
                            children: [
                              Icon(Icons.timer_outlined, color: Colors.amber[400], size: 28),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  'Note: Your turn will auto-expire after 2 minutes if no item is selected.',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.amber[200],
                                    fontWeight: FontWeight.w500,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusItem(String label, String value, Color valueColor) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
        const SizedBox(height: 8),
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: valueColor)),
      ],
    );
  }
}
