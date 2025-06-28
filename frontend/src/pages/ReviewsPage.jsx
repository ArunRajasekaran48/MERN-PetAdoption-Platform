import React, { useEffect, useState } from "react";
import { getAllReviews } from "../services/petService";
import { Star } from "lucide-react";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getAllReviews();
        setReviews(data);
        setError(null);
      } catch (err) {
        setError("Failed to load reviews.");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-purple-800">All Reviews</h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No reviews yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center w-full max-w-xs transition-transform hover:scale-105"
              >
                {/* Reviewer */}
                <div className="flex items-center mb-3 w-full">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-700 mr-3">
                    {review.userId?.name?.[0] || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">{review.userId?.name || "Anonymous"}</div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} fill={star <= review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Comment */}
                <div className="text-gray-600 text-center mb-4 italic">"{review.comment}"</div>
                {/* Pet Image & Name */}
                <div className="flex flex-col items-center w-full bg-gray-50 rounded-xl p-4">
                  {review.petId?.images && review.petId.images.length > 0 && (
                    <img
                      src={review.petId.images[0]}
                      alt={review.petId.name}
                      className="w-20 h-20 object-cover rounded-full mb-2 border-2 border-purple-200"
                    />
                  )}
                  <span className="text-sm text-purple-700 font-semibold">
                    {review.petId?.name ? `Pet: ${review.petId.name}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage; 