import { useEffect, useRef, useState } from 'react';
import { sessaoService } from '../../../services/sessaoService';

interface PainelTransmissaoProps {
  isGravacao: boolean;
  sessaoId: number;
}
export function PainelTransmissao( {isGravacao, sessaoId}: PainelTransmissaoProps)
{ 
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState("Aguardando conexão do Meta Quest 3S...");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isGravacao) {
      iniciarGravacao();
    } else {
      pararGravacao();
    }
  }, [isGravacao]); // sempre quando houver mudanças

  useEffect(() =>
  {
   
    wsRef.current = new WebSocket("ws://192.168.15.9:8080/ws/webrtc"); 

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    pc.ontrack = (event) =>
    {
      setStatus("Transmissão Ativa 🟢");
      
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
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

    wsRef.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.tipo === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        wsRef.current?.send(JSON.stringify({
          tipo: 'answer',
          sdp: answer.sdp
        }));
      } 
      else if (msg.tipo === 'ice') {
        await pc.addIceCandidate(new RTCIceCandidate({
          candidate: msg.candidate,
          sdpMid: msg.sdpMid,
          sdpMLineIndex: msg.sdpMLineIndex
        }));
      }
    };

    return () => {
      pc.close();
      wsRef.current?.close();
    };
  }, []);
  const iniciarGravacao = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; 

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        console.log("Processando vídeo para envio...");
    
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        try {
          await sessaoService.addGravacao(sessaoId, videoBlob);
          alert("Gravação Salva com Sucesso");
        } catch (error) {
          console.error("Erro ao enviar o vídeo:", error);
          alert("Erro ao Salvar Gravação");
        }
      };
      mediaRecorder.start();
    }
  };

  const pararGravacao = () => {
    mediaRecorderRef.current?.stop();
  };
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