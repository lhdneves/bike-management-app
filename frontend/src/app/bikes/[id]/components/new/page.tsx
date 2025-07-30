'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../hooks/useAuth';
import { bikeAPI } from '../../../../../utils/bikeApi';
import { ComponentFormData, Bike } from '../../../../../types';
import { Settings, ArrowLeft, Save } from 'lucide-react';

export default function NewComponentPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [bike, setBike] = useState<Bike | null>(null);
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    description: '',
    installationDate: '',
    observation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBike, setLoadingBike] = useState(true);
  const [error, setError] = useState('');

  const bikeId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/Auth/login');
    }
  }, [isAuthenticated, router]);

  // Load bike data
  useEffect(() => {
    if (isAuthenticated && bikeId) {
      loadBike();
    }
  }, [isAuthenticated, bikeId]);

  const loadBike = async () => {
    try {
      const response = await bikeAPI.getBikeById(bikeId);
      if (response.success) {
        setBike(response.data as Bike);
      } else {
        setError('Bicicleta não encontrada');
      }
    } catch (err: any) {
      console.error('Error loading bike:', err);
      setError('Erro ao carregar dados da bicicleta');
    } finally {
      setLoadingBike(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        installationDate: formData.installationDate || undefined,
        observation: formData.observation?.trim() || undefined
      };

      console.log('🔧 Enviando dados do componente:', submitData);
      const response = await bikeAPI.createComponent(bikeId, submitData);
      
      if (response.success) {
        router.push(`/bikes/${bikeId}?tab=components`);
      } else {
        setError('Erro ao cadastrar componente');
      }
    } catch (err: any) {
      console.error('Error creating component:', err);
      setError('Erro ao cadastrar componente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loadingBike) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !bike) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push(`/bikes/${bikeId}`)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Adicionar Componente</h1>
                <p className="text-sm text-gray-600">
                  Para: {bike?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Informações do Componente
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Adicione um novo componente à sua bicicleta para acompanhar manutenções específicas.
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
                Nome do Componente *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
                placeholder="Ex: Freio Dianteiro, Corrente, Pedal"
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
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm resize-vertical"
                placeholder="Descreva o componente, marca, modelo, especificações..."
              />
            </div>

            {/* Data de Instalação */}
            <div>
              <label htmlFor="installationDate" className="block text-sm font-medium text-gray-700">
                Data de Instalação
              </label>
              <input
                type="date"
                id="installationDate"
                name="installationDate"
                value={formData.installationDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Data em que o componente foi instalado na bicicleta
              </p>
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="observation" className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                id="observation"
                name="observation"
                rows={2}
                value={formData.observation}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm resize-vertical"
                placeholder="Observações especiais, condições de uso, garantia..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/bikes/${bikeId}`)}
                className="px-4 py-2 border border-blue-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Adicionar Componente
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Dica
          </h4>
          <p className="text-sm text-blue-700">
            Registre componentes importantes como freios, corrente, pneus e outros itens que precisam 
            de manutenção regular. Isso ajudará você a acompanhar quando cada peça foi trocada ou revisada.
          </p>
        </div>
      </div>
    </div>
  );
}