interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
  message?: string
}

export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  message = 'Carregando...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <div className={`text-gray-400 ${textSizeClasses[size]}`}>
          {message}
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        {spinner}
      </div>
    )
  }

  return spinner
}
