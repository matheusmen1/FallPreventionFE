import { useEffect, useRef, useState } from 'react';
import { sessaoService } from '../../../services/sessaoService';
import type { Configuracao } from '../../configuracao/types/configuracao';
import { configuracaoService } from '../../../services/configuracaoService';
interface PainelTransmissaoProps {
  sessaoId: number;
  sessaoFaseId?: number;   
  gravar: boolean;         
  emExecucao: boolean;     
  reinicioKey: number;     
}
export function PainelTransmissao({ sessaoId, sessaoFaseId, gravar, emExecucao, reinicioKey }: PainelTransmissaoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState("Aguardando Transmissão...");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const gravadoRef = useRef<{ stream: MediaStream; fase: number } | null>(null);
  const reinicioKeyRef = useRef(reinicioKey);
  reinicioKeyRef.current = reinicioKey;
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null);
  useEffect(() => {
    obterIPv4Local();
  }, []);

  useEffect(() => {
    if (!emExecucao || !gravar || !stream || !sessaoFaseId || !sessaoId) {
      console.log("[gravação] não iniciou", { emExecucao, gravar, temStream: !!stream, sessaoFaseId });
      return;
    }

    const ultimo = gravadoRef.current;
    if (ultimo && ultimo.stream === stream && ultimo.fase !== sessaoFaseId) {
      console.log("[gravação] aguardando stream do novo app", { faseAnterior: ultimo.fase, faseAtual: sessaoFaseId });
      return;
    }
    gravadoRef.current = { stream, fase: sessaoFaseId };
    console.log("[gravação] iniciou fase", sessaoFaseId);

    const faseGravada = sessaoFaseId;      
    const sessaoGravada = sessaoId;
    const chaveInicio = reinicioKey;
    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    mediaRecorder.onstop = async () => {
      if (reinicioKeyRef.current !== chaveInicio) {
        console.log("[gravação] descartada (reinício), fase", faseGravada);
        return;
      }
      if (chunks.length === 0) {
        console.log("[gravação] sem dados, nada enviado, fase", faseGravada);
        return;
      }
      console.log("[gravação] enviando fase", faseGravada, chunks.length, "chunks");
      try {
        await sessaoService.addGravacao(sessaoGravada, faseGravada, new Blob(chunks, { type: 'video/webm' }));
      } catch (error) {
        console.error("Erro ao enviar a gravação da fase:", error);
      }
    };
    mediaRecorder.start();

    return () => {
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    };
  }, [sessaoId, sessaoFaseId, gravar, emExecucao, stream, reinicioKey]);

  useEffect(() => {
    if (configuracao?.ip) {
      wsRef.current = new WebSocket(`ws://${configuracao?.ip}:8080/ws/webrtc`);

      const criarPeerConnection = () => {
        if (pcRef.current) {
          pcRef.current.close();
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        pcRef.current = pc;
        pc.onconnectionstatechange = () => {
          if (pcRef.current !== pc) 
            return; 
          if (pc.connectionState === "failed" || pc.connectionState === "disconnected" || pc.connectionState === "closed") {
            setStatus("Aguardando Transmissão...");
            setStream(null);
            if (videoRef.current != null) {
              videoRef.current.srcObject = null;
            }
          }
        };
        pc.ontrack = (event) => {
          console.log("[webrtc] ontrack: novo stream");
          setStatus("Transmissão Ativa 🟢");
          if (videoRef.current) {
            const novoStream = (event.streams && event.streams[0])
              ? event.streams[0]
              : new MediaStream([event.track]);

            videoRef.current.srcObject = novoStream;
            videoRef.current.play().catch(err => console.warn("Aguardando interação:", err));
            setStream(novoStream);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              tipo: 'ice',
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex
            }));
          }

        };

        return pc;
      };

      wsRef.current.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.tipo === 'offer') {
          const pc = criarPeerConnection();
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          wsRef.current?.send(JSON.stringify({
            tipo: 'answer',
            sdp: answer.sdp
          }));
        }
        else if (msg.tipo === 'ice' && pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate({
            candidate: msg.candidate,
            sdpMid: msg.sdpMid,
            sdpMLineIndex: msg.sdpMLineIndex
          }));
        }
      };

      return () => {
        pcRef.current?.close();
        wsRef.current?.close();
      };
    }
  }, [configuracao?.ip]);
  async function obterIPv4Local() {
    try {
      const configuracao = await configuracaoService.getAll();
      setConfiguracao(configuracao[0]);
    } catch (error) {
      console.error("Erro ao obter IPv4 Local:", error);
    }
  }
  return (
    <div className="w-full max-w-[90%] flex flex-col items-center justify-center">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Visão do Paciente
        </h2>
        <span className={`text-sm font-bold uppercase tracking-wider ${status.includes('Ativa') ? 'text-green-400' : 'text-yellow-400 animate-pulse'}`}>
          {status}
        </span>
      </div>

      <div className="w-full aspect-video border-2 border-slate-700 rounded-2xl overflow-hidden bg-black shadow-2xl relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {!status.includes('Ativa') && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
            <svg className="w-12 h-12 text-slate-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}