import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyProducts, selectProducts, selectIsFetchLoading, publishProduct, unpublishProduct, selectPublishingId, deleteProduct, selectDeletingId } from '../store/slices/productSlice';
import type { Product } from '../api/product';

const Home = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const isFetching = useAppSelector(selectIsFetchLoading);
  const publishingId = useAppSelector(selectPublishingId);
  const deletingId = useAppSelector(selectDeletingId);

  const [activeTab, setActiveTab] = useState<'published' | 'unpublished'>('published');

  useEffect(() => {
    dispatch(fetchMyProducts());
  }, [dispatch]);

  const publishedProducts = products.filter((p) => p.isPublished);
  const unpublishedProducts = products.filter((p) => !p.isPublished);
  const displayedProducts = activeTab === 'published' ? publishedProducts : unpublishedProducts;

  const handleTogglePublish = async (product: Product) => {
    if (product.isPublished) {
      await dispatch(unpublishProduct(product._id));
    } else {
      await dispatch(publishProduct(product._id));
    }
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(product._id));
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-white -m-6">
      {/* Tabs Header */}
      <div className="bg-white px-8 flex items-center gap-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('published')}
          className={`py-4 text-sm font-semibold transition-colors border-b-[3px] ${
            activeTab === 'published' ? 'border-blue-500 text-[#2a2a4a]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Published
        </button>
        <button
          onClick={() => setActiveTab('unpublished')}
          className={`py-4 text-sm font-semibold transition-colors border-b-[3px] ${
            activeTab === 'unpublished' ? 'border-blue-500 text-[#2a2a4a]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Unpublished
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 flex flex-col">
        {isFetching ? (
          <div className="flex-1 flex items-center justify-center">
            <svg className="animate-spin text-blue-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-[#1a1a2e] mb-6">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <line x1="17.5" y1="14" x2="17.5" y2="21" />
                <line x1="14" y1="17.5" x2="21" y2="17.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">No {activeTab === 'published' ? 'Published' : 'Unpublished'} Products</h2>
            <p className="text-sm text-gray-400 max-w-[250px]">
              Your {activeTab === 'published' ? 'Published' : 'Unpublished'} Products will appear here<br/>
              Create your first product to publish
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedProducts.map((product) => {
              const isPublishing = publishingId === product._id;
              const isDeleting = deletingId === product._id;

              return (
                <div key={product._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4">
                  {/* Image Carousel Mockup */}
                  <div className="h-48 flex flex-col items-center justify-center mb-4 border border-gray-100 rounded-lg overflow-hidden relative">
                    <img 
                      src={product.productImage} 
                      alt={product.productName} 
                      className="h-full w-full object-contain p-2" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3C/svg%3E";
                      }} 
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/80 px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-[#2a2a4a] text-sm mb-4 leading-tight">{product.productName}</h3>

                  {/* Details Grid */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Product type -</span>
                      <span className="text-gray-600 font-medium">{product.productType || 'Food'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Quantity Stock -</span>
                      <span className="text-gray-800 font-medium">{product.quantityStock}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">MRP-</span>
                      <span className="text-gray-800 font-medium">₹ {product.mrp}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Selling Price -</span>
                      <span className="text-gray-800 font-bold">₹ {product.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Brand Name -</span>
                      <span className="text-gray-800 font-bold">{product.brandName}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Total Number of images -</span>
                      <span className="text-gray-800 font-medium">5</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Exchange Eligibility -</span>
                      <span className="text-gray-800 font-bold">{product.exchange ? 'YES' : 'NO'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(product)}
                      disabled={isPublishing}
                      className={`flex-1 ${
                        product.isPublished ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-800'
                      } text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2`}
                    >
                      {isPublishing && (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      )}
                      {product.isPublished ? 'Unpublish' : 'Publish'}
                    </button>

                    <button className="flex-1 bg-white hover:bg-gray-50 text-[#2a2a4a] text-sm font-semibold py-2.5 rounded-lg border border-gray-200 transition-colors">
                      Edit
                    </button>

                    <button 
                      onClick={() => handleDelete(product)}
                      disabled={isDeleting}
                      className="w-[42px] h-[42px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                    >
                      {isDeleting ? (
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
