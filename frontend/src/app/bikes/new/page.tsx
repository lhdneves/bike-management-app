'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { bikeAPI } from '../../../utils/bikeApi';
import { BikeType, TractionType, BikeFormData } from '../../../types';
import { Bike, ArrowLeft, Save } from 'lucide-react';

export default function NewBikePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<BikeFormData>({
    name: '',
    description: '',
    manufacturer: '',
    type: BikeType.URBAN,
    tractionType: TractionType.MANUAL
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if not authenticated (client-side only)
  useEffect(() => {
    if (!isAuthenticated) {
      setIsRedirecting(true);
      router.push('/Auth/login');
    }
  }, [isAuthenticated, router]);

  // Show loading while redirecting
  if (!isAuthenticated || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Clean and prepare data
    const submitData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      manufacturer: formData.manufacturer?.trim() || undefined,
      type: formData.type,
      tractionType: formData.tractionType
    };

    console.log('🚴‍♂️ Enviando dados da bicicleta:', submitData);

    try {
      const response = await bikeAPI.createBike(submitData);
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        router.push('/dashboard?tab=bikes');
      } else {
        console.error('❌ Falha na criação da bicicleta:', response);
        setError('Erro ao cadastrar bicicleta');
      }
    } catch (err: any) {
      console.error('❌ Erro no catch:', err);
      console.error('❌ Response data:', err.response?.data);
      setError('Erro ao cadastrar bicicleta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <Bike className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Cadastrar Nova Bicicleta</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Informações da Bicicleta
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Preencha os dados da sua bicicleta para começar a gerenciar manutenções e componentes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da Bicicleta *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm"
                placeholder="Ex: Minha Mountain Bike"
              />
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Tipo da Bicicleta *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm"
              >
                <option value={BikeType.URBAN}>Urbana</option>
                <option value={BikeType.SPEED}>Speed</option>
                <option value={BikeType.MOUNTAIN_BIKE}>Mountain Bike</option>
                <option value={BikeType.ELECTRIC}>Elétrica</option>
              </select>
            </div>

            {/* Tipo de Tração */}
            <div>
              <label htmlFor="tractionType" className="block text-sm font-medium text-gray-700">
                Tipo de Tração *
              </label>
              <select
                id="tractionType"
                name="tractionType"
                required
                value={formData.tractionType}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm"
              >
                <option value={TractionType.MANUAL}>Manual</option>
                <option value={TractionType.ASSISTED}>Assistida</option>
              </select>
            </div>

            {/* Fabricante */}
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                Fabricante
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm"
                placeholder="Ex: Specialized, Trek, Caloi"
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm resize-vertical"
                placeholder="Descreva sua bicicleta, modelo, ano, observações especiais..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-orange-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cadastrar Bicicleta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-orange-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Dica
          </h4>
          <p className="text-sm text-blue-700">
            Após cadastrar sua bicicleta, você poderá adicionar componentes, agendar manutenções 
            e acompanhar o histórico de cuidados da sua bike.
          </p>
        </div>
      </div>
    </div>
  );
}