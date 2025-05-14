import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getAllPets } from '../services/petService';

const PetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const pets = await getAllPets();
        const foundPet = pets.find((p) => p._id === id);
        setPet(foundPet);
        setError(null);
      } catch (err) {
        setError('Failed to fetch pet details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }
  if (error || !pet) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error || 'Pet not found.'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">&larr; Back</button>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Hello !!! My name is {pet.name}.</h1>
      <div className="max-w-3xl mx-auto">
        <Slider {...sliderSettings}>
          {pet.images?.map((image, idx) => (
            <div key={idx}>
              <img src={image} alt={`${pet.name} - ${idx + 1}`} className="w-full h-[400px] object-contain bg-black mx-auto" />
            </div>
          ))}
        </Slider>
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <p className="mb-2"><span className="font-semibold">Breed:</span> {pet.breed}</p>
          <p className="mb-2"><span className="font-semibold">Age:</span> {pet.age} years</p>
          <p className="mb-2"><span className="font-semibold">Species:</span> {pet.species}</p>
          <p className="mb-2"><span className="font-semibold">Gender:</span> {pet.gender}</p>
          <p className="mb-2"><span className="font-semibold">Status:</span> {pet.adoptionStatus}</p>
          <p className="mb-2"><span className="font-semibold">Description:</span> {pet.description}</p>
          {pet.medicalHistory && <p className="mb-2"><span className="font-semibold">Medical History:</span> {pet.medicalHistory}</p>}
          {pet.behavior && <p className="mb-2"><span className="font-semibold">Behavior:</span> {pet.behavior}</p>}
          {pet.specialNeeds && <p className="mb-2"><span className="font-semibold">Special Needs:</span> {pet.specialNeeds}</p>}
        </div>
      </div>
    </div>
  );
};

export default PetDetailsPage; 