import { Bike, Wrench, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bike className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">BikeManager</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/Auth/login"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/Auth/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Gerencie sua
            <span className="text-primary-600"> bicicleta</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Controle manutenções, componentes, despesas e encontre mecânicos qualificados.
            Tudo em um só lugar para manter sua bike em perfeito estado.
          </p>
          <div className="mt-10">
            <Link
              href="/Auth/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg transition-colors"
            >
              Começar Agora
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Bike className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gestão de Bicicletas
              </h3>
              <p className="text-gray-600">
                Cadastre e gerencie todas as suas bicicletas em um só lugar
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Wrench className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Controle de Manutenção
              </h3>
              <p className="text-gray-600">
                Agende e registre manutenções com lembretes automáticos
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rede de Mecânicos
              </h3>
              <p className="text-gray-600">
                Encontre mecânicos qualificados na sua região
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <BarChart3 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Controle de Gastos
              </h3>
              <p className="text-gray-600">
                Monitore despesas e otimize seus investimentos
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 BikeManager. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}