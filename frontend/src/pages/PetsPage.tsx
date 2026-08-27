import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { petApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PetsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mine = searchParams.get('mine') === 'true';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'MALE',
    color: '',
    weight: '',
    description: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['pets', mine],
    queryFn: () => petApi.getAll({ mine }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      petApi.create({
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        gender: form.gender,
        color: form.color || undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        description: form.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setShowForm(false);
      setForm({ name: '', species: 'Dog', breed: '', gender: 'MALE', color: '', weight: '', description: '' });
    },
  });

  const pets = data?.pets ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{mine ? 'My Pets' : 'All Pets'}</h1>
          <p className="text-gray-500">{pets.length} pet{pets.length !== 1 ? 's' : ''} found</p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add Pet'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="font-semibold mb-4">Register New Pet</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              placeholder="Pet name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <select
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option>Dog</option>
              <option>Cat</option>
              <option>Bird</option>
              <option>Rabbit</option>
              <option>Other</option>
            </select>
            <input
              placeholder="Breed"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
            <input
              placeholder="Color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              placeholder="Weight (kg)"
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-4 py-2 border rounded-lg sm:col-span-2"
              rows={2}
            />
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!form.name || createMutation.isPending}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Pet'}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Loading pets...</p>
      ) : pets.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">🐾</p>
          <p>No pets found. {user && 'Add your first pet to get started.'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="h-40 bg-primary-100 flex items-center justify-center text-5xl">
                {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐈' : '🐾'}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    {pet.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {pet.breed ? `${pet.breed} · ` : ''}{pet.species}
                  {pet.age ? ` · ${pet.age}` : ''}
                </p>
                {pet.vaccinationStatus && (
                  <p className="text-xs mt-2 text-primary-600">
                    Vaccination: {pet.vaccinationStatus.replace('_', ' ')}
                  </p>
                )}
                {pet.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pet.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
