import { useNavigate, useParams } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  backTo?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, showBack = true, backTo, actions }: PageHeaderProps) {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()

  function handleBack() {
    if (backTo) {
      navigate(backTo)
    } else if (slug) {
      navigate(`/${slug}/dashboard`)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Voltar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {slug && (
              <p className="text-sm text-gray-400 mt-0.5">{slug}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
