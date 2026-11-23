import { useState } from "react";
import { SecaoAjuda, Passos, Dica, Rotulo } from "../components/SecaoAjuda";

const SECOES = [
  { id: "pacientes", titulo: "Pacientes" },
  { id: "criar-sessao", titulo: "Criar sessão" },
  { id: "aprovacao", titulo: "Aprovação" },
  { id: "execucao", titulo: "Executar sessão" },
  { id: "relatorio", titulo: "Relatório" },
];

export function Ajuda() {
  const [abertas, setAbertas] = useState<Record<string, boolean>>({ pacientes: true });

  function alternar(id: string) {
    setAbertas((atual) => ({ ...atual, [id]: !atual[id] }));
  }

  function irPara(id: string) {
    setAbertas((atual) => ({ ...atual, [id]: true }));
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const props = (id: string) => ({ id, aberta: !!abertas[id], onAlternar: () => alternar(id) });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Como Usar o Sistema</h1>
        <p className="text-sm text-gray-500 mt-1">Do cadastro do paciente até o relatório da sessão.</p>
      </div>

      <nav className="flex flex-wrap justify-center gap-2">
        {SECOES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => irPara(s.id)}
            className="px-3 py-1.5 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            {i + 1}. {s.titulo}
          </button>
        ))}
      </nav>

      <SecaoAjuda {...props("pacientes")} numero={1} titulo="Pacientes" resumo="Menu Gerenciamento → Pacientes">
        <Passos
          itens={[
            <>Clique em <Rotulo>+ Novo Paciente</Rotulo>.</>,
            <>Em "Dados Pessoais", preencha nome, CPF, e-mail, telefone, nascimento e sexo. A doença é opcional.</>,
            <>Em "Anamnese (FES-I Brasil)", responda as 16 perguntas de 1 a 4.</>,
            <>Clique em <Rotulo>Confirmar</Rotulo>.</>,
          ]}
        />
        <Dica>
          A pontuação do FES-I define quais exercícios aparecem ao criar a sessão. Quanto maior a preocupação com
          quedas, mais fáceis são os exercícios oferecidos.
        </Dica>
      </SecaoAjuda>

      <SecaoAjuda {...props("criar-sessao")} numero={2} titulo="Criar sessão" resumo="Menu Sessões → Nova Sessão">
        <Passos
          itens={[
            <><strong>Paciente:</strong> escolha o paciente.</>,
            <>
              <strong>Exercício:</strong> clique num exercício, escolha <Rotulo>Repetições</Rotulo> ou{" "}
              <Rotulo>Tempo</Rotulo>, ajuste o valor e confirme. Repita para cada exercício.
            </>,
            <><strong>Observações:</strong> opcional. Marque os monitores que podem abrir a sessão.</>,
            <><strong>Agendamento:</strong> defina data e hora e clique em <Rotulo>Confirmar</Rotulo>.</>,
          ]}
        />
        <Dica>
          Marque <Rotulo>Gravar</Rotulo> nos exercícios que você quer gravar em vídeo. A gravação é automática e o vídeo
          de cada exercício aparece no relatório.
        </Dica>
        <Dica tipo="atencao">
          Sessão criada por fisioterapeuta já fica <strong>Aprovada</strong>. Sessão criada por monitor fica{" "}
          <strong>Pendente</strong> até o fisioterapeuta aprovar.
        </Dica>
      </SecaoAjuda>

      <SecaoAjuda {...props("aprovacao")} numero={3} titulo="Aprovação" resumo="Menu Sessões → Sessões Pendentes (fisioterapeuta)">
        <Passos
          itens={[
            <>Abra <Rotulo>Sessões Pendentes</Rotulo> e confira os dados da sessão.</>,
            <>Clique em <Rotulo>Aprovar</Rotulo> para liberar a sessão.</>,
            <>
              Ou clique em <Rotulo>Solicitar Alteração</Rotulo> e escreva o motivo. O monitor vê o motivo ao alterar a
              sessão e a reenvia para aprovação.
            </>,
          ]}
        />
      </SecaoAjuda>

      <SecaoAjuda {...props("execucao")} numero={4} titulo="Executar sessão" resumo="Menu Sessões → Sessões Disponíveis">
        <Passos
          itens={[
            <>Ligue o capacete e coloque no paciente.</>,
            <>Clique em <Rotulo>ABRIR SESSÃO</Rotulo>. Quando o capacete estiver pronto, clique em <Rotulo>Iniciar Sessão</Rotulo>.</>,
            <>
              Acompanhe pela "Visão do Paciente". Use <Rotulo>Pausar Exercício</Rotulo> e{" "}
              <Rotulo>Próximo Exercício</Rotulo> quando precisar.
            </>,
            <>Ao terminar o último exercício, o sistema abre o relatório sozinho.</>,
          ]}
        />
        <Dica>
          Outros botões: <Rotulo>Reiniciar Exercício</Rotulo>, <Rotulo>Reiniciar Sessão</Rotulo>,{" "}
          <Rotulo>Adicionar Observação</Rotulo>, <Rotulo>Enviar Mensagem</Rotulo> (texto para o paciente) e{" "}
          <Rotulo>Recentralizar</Rotulo> (visão do capacete).
        </Dica>
      </SecaoAjuda>

      <SecaoAjuda {...props("relatorio")} numero={5} titulo="Relatório" resumo="Menu Relatórios → Resultados">
        <Passos
          itens={[
            <>
              Em cada exercício, veja o que foi executado e, se houver, clique em <Rotulo>Ver Gravação</Rotulo>.
            </>,
            <>Escolha o item da Escala de Berg e a pontuação de 0 a 4.</>,
            <>Clique em <Rotulo>Próximo Exercício →</Rotulo> para salvar a nota e seguir.</>,
            <>No passo "Conclusão", escreva a observação geral (opcional) e clique em <Rotulo>Confirmar</Rotulo>.</>,
          ]}
        />
        <Dica tipo="atencao">
          A sessão só vira <strong>Concluída</strong> quando você clica em Confirmar. Se a gravação do último exercício
          ainda não apareceu, aguarde alguns segundos.
        </Dica>
      </SecaoAjuda>
    </div>
  );
}
