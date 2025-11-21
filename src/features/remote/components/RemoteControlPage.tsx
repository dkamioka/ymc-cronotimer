import { useParams } from 'react-router-dom'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useRemoteControl } from '../hooks/useRemoteControl'

export function RemoteControlPage() {
  const { slug } = useParams<{ slug: string }>()
  const { connected, timerState, sendCommand } = useRemoteControl(slug || '')

  async function handleCommand(action: 'start' | 'pause' | 'resume' | 'skip' | 'previous') {
    const success = await sendCommand(action)
    if (!success) {
      console.error('Failed to send command:', action)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PageHeader title="Controle Remoto" />

      <div className="max-w-2xl mx-auto p-6">
        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Status da Conexão</h2>
              <p className="text-gray-400">
                {connected ? 'Conectado à TV' : 'Desconectado'}
              </p>
            </div>
            <div
              className={`w-4 h-4 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Current Workout Info */}
        {timerState && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Treino Atual</h2>
            {timerState.current_section && (
              <p className="text-gray-300 mb-2">
                {timerState.current_section}
                {timerState.current_exercise && ` - ${timerState.current_exercise}`}
              </p>
            )}
            <div className="text-4xl font-mono font-bold mb-4">
              {timerState.display_time}
            </div>
            <div className="inline-block px-3 py-1 bg-blue-600 rounded text-sm">
              {timerState.state.status === 'running' ? '▶ Executando' :
               timerState.state.status === 'paused' ? '⏸ Pausado' :
               timerState.state.status === 'completed' ? '✓ Completo' :
               '⏹ Parado'}
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6">Controles</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Start/Pause/Resume */}
            {(!timerState || timerState.state.status === 'idle') && (
              <button
                onClick={() => handleCommand('start')}
                disabled={!connected}
                className="col-span-2 px-8 py-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-2xl font-bold transition-colors"
              >
                ▶ INICIAR
              </button>
            )}

            {timerState?.state.status === 'running' && (
              <button
                onClick={() => handleCommand('pause')}
                disabled={!connected}
                className="col-span-2 px-8 py-6 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-2xl font-bold transition-colors"
              >
                ⏸ PAUSAR
              </button>
            )}

            {timerState?.state.status === 'paused' && (
              <button
                onClick={() => handleCommand('resume')}
                disabled={!connected}
                className="col-span-2 px-8 py-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-2xl font-bold transition-colors"
              >
                ▶ CONTINUAR
              </button>
            )}

            {/* Previous */}
            <button
              onClick={() => handleCommand('previous')}
              disabled={!connected}
              className="px-6 py-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-xl text-xl font-semibold transition-colors"
            >
              ⏮ VOLTAR
            </button>

            {/* Skip */}
            <button
              onClick={() => handleCommand('skip')}
              disabled={!connected}
              className="px-6 py-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-xl text-xl font-semibold transition-colors"
            >
              ⏭ PULAR
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">
            Como usar
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Abra a tela da TV no navegador do computador</li>
            <li>• Este controle remoto sincroniza automaticamente</li>
            <li>• Use os botões para controlar o timer remotamente</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
