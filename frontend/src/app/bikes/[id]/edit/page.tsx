'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { bikeAPI } from '../../../../utils/bikeApi';
import { BikeType, TractionType, BikeFormData, Bike } from '../../../../types';
import { Bike as BikeIcon, ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function EditBikePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [bike, setBike] = useState<Bike | null>(null);
  const [formData, setFormData] = useState<BikeFormData>({
    name: '',
    description: '',
    manufacturer: '',
    type: BikeType.URBAN,
    tractionType: TractionType.MANUAL
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBike, setLoadingBike] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        const bikeData = response.data as Bike;
        setBike(bikeData);
        setFormData({
          name: bikeData.name,
          description: bikeData.description || '',
          manufacturer: bikeData.manufacturer || '',
          type: bikeData.type as BikeType,
          tractionType: bikeData.tractionType as TractionType
        });
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
        manufacturer: formData.manufacturer?.trim() || undefined,
        type: formData.type,
        tractionType: formData.tractionType
      };

      console.log('🚴‍♂️ Atualizando dados da bicicleta:', submitData);
      const response = await bikeAPI.updateBike(bikeId, submitData);
      
      if (response.success) {
        router.push(`/bikes/${bikeId}`);
      } else {
        setError('Erro ao atualizar bicicleta');
      }
    } catch (err: any) {
      console.error('Error updating bike:', err);
      setError('Erro ao atualizar bicicleta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await bikeAPI.deleteBike(bikeId);
      
      if (response.success) {
        router.push('/dashboard?tab=bikes');
      } else {
        setError('Erro ao excluir bicicleta');
      }
    } catch (err: any) {
      console.error('Error deleting bike:', err);
      setError('Erro ao excluir bicicleta');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          <BikeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/bikes/${bikeId}`)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <BikeIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Editar Bicicleta</h1>
                  <p className="text-sm text-gray-600">
                    {bike?.name}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </button>
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
              Atualize as informações da sua bicicleta.
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
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
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
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
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
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
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
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
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
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-blue-200 bg-blue-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors text-sm resize-vertical"
                placeholder="Descreva sua bicicleta, modelo, ano, observações especiais..."
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
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Excluir Bicicleta
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Tem certeza que deseja excluir a bicicleta "{bike?.name}"? 
                    Esta ação não pode ser desfeita e todos os componentes e manutenções associados também serão removidos.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}