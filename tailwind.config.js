/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./formations/**/*.md",
    "./public/generated/**/*.json"
  ],
  theme: {
    extend: {
      colors: {
        // Thème industriel
        industrial: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        
        // Couleurs spécifiques aux formations
        formation: {
          equipment: '#1e40af',    // Bleu pour équipements
          skills: '#059669',       // Vert pour compétences
          safety: '#dc2626',       // Rouge pour sécurité
          general: '#6366f1'       // Indigo pour général
        },
        
        // États et alertes
        alert: {
          info: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
        display: ['Inter', 'sans-serif']
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }]
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounceSoft 1s infinite'
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      
      // Grille personnalisée pour les layouts de formation
      gridTemplateColumns: {
        'formation': '250px 1fr',
        'formation-mobile': '1fr',
        'card-grid': 'repeat(auto-fit, minmax(300px, 1fr))'
      },
      
      // Largeurs personnalisées
      maxWidth: {
        'formation': '1200px',
        'content': '800px',
        'sidebar': '280px'
      },
      
      // Z-index pour les couches
      zIndex: {
        'modal': '50',
        'dropdown': '40',
        'header': '30',
        'sidebar': '20',
        'content': '10'
      }
    }
  },
  plugins: [
    // Plugin Typography pour les classes prose
    require('@tailwindcss/typography'),
    
    // Plugin pour les classes utilitaires personnalisées
    function({ addUtilities, addComponents, theme }) {
      // Utilitaires pour les callouts
      addComponents({
        '.callout': {
          '@apply p-4 rounded-lg border-l-4 mb-4': {},
        },
        '.callout-info': {
          '@apply bg-blue-50 border-blue-400 text-blue-800': {},
        },
        '.callout-warning': {
          '@apply bg-yellow-50 border-yellow-400 text-yellow-800': {},
        },
        '.callout-danger': {
          '@apply bg-red-50 border-red-400 text-red-800': {},
        },
        '.callout-success': {
          '@apply bg-green-50 border-green-400 text-green-800': {},
        },
        '.callout-video': {
          '@apply bg-purple-50 border-purple-400 text-purple-800': {},
        },
        '.callout-tip': {
          '@apply bg-indigo-50 border-indigo-400 text-indigo-800': {},
        }
      });
      
      // Styles pour les contenus de formation
      addComponents({
        '.formation-content': {
          '@apply prose prose-lg max-w-none': {},
          'h1': '@apply text-3xl font-bold text-gray-900 mb-6 mt-8',
          'h2': '@apply text-2xl font-semibold text-gray-800 mb-4 mt-6',
          'h3': '@apply text-xl font-medium text-gray-700 mb-3 mt-4',
          'p': '@apply text-gray-600 leading-relaxed mb-4',
          'ul, ol': '@apply text-gray-600 mb-4 pl-6',
          'li': '@apply mb-2',
          'blockquote': '@apply border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4',
          'code': '@apply bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm',
          'pre': '@apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4',
          'table': '@apply w-full border-collapse border border-gray-300 mb-4',
          'th': '@apply border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold',
          'td': '@apply border border-gray-300 px-4 py-2'
        }
      });
      
      // Boutons personnalisés
      addComponents({
        '.btn': {
          '@apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200': {},
        },
        '.btn-primary': {
          '@apply btn text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': {},
        },
        '.btn-secondary': {
          '@apply btn text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-blue-500': {},
        },
        '.btn-success': {
          '@apply btn text-white bg-green-600 hover:bg-green-700 focus:ring-green-500': {},
        },
        '.btn-danger': {
          '@apply btn text-white bg-red-600 hover:bg-red-700 focus:ring-red-500': {},
        },
        '.btn-warning': {
          '@apply btn text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500': {},
        }
      });
      
      // Cards personnalisées
      addComponents({
        '.card': {
          '@apply bg-white rounded-lg shadow-soft border border-gray-200 overflow-hidden': {},
        },
        '.card-header': {
          '@apply px-6 py-4 border-b border-gray-200 bg-gray-50': {},
        },
        '.card-body': {
          '@apply px-6 py-4': {},
        },
        '.card-footer': {
          '@apply px-6 py-4 border-t border-gray-200 bg-gray-50': {},
        }
      });
      
      // Layout helpers
      addUtilities({
        '.center-absolute': {
          '@apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2': {},
        },
        '.center-flex': {
          '@apply flex items-center justify-center': {},
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      });
    }
  ]
}