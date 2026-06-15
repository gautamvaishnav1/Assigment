import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMyProducts,
  addProduct,
  editProduct,
  deleteProduct,
  publishProduct,
  clearSubmitError,
  clearError,
  selectProducts,
  selectIsFetchLoading,
  selectIsSubmitLoading,
  selectIsImageUploading,
  selectDeletingId,
  selectPublishingId,
  selectProductError,
  selectSubmitError,
} from '../store/slices/productSlice';
import type { Product } from '../api/product';

/* ─── Toast ─────────────────────────────────────────────────────────────── */
interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type = 'success', onClose }: ToastProps) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-5 py-3 animate-fade-in">
    {type === 'success' ? (
      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    ) : (
      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    )}
    <span className="text-sm font-medium text-gray-800">{message}</span>
    <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

/* ─── Image Upload Progress Banner ───────────────────────────────────────── */
const ImageUploadBanner = () => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-indigo-600 text-white rounded-xl shadow-xl px-5 py-3 animate-fade-in">
    <svg className="animate-spin flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
    <div>
      <p className="text-sm font-semibold">Uploading image to ImageKit…</p>
      <p className="text-xs text-indigo-200">This may take a moment</p>
    </div>
    {/* Progress bar shimmer */}
    <div className="w-24 h-1.5 bg-indigo-400 rounded-full overflow-hidden">
      <div className="h-full bg-white rounded-full animate-[shimmer_1.2s_ease-in-out_infinite]" style={{ width: '60%', animation: 'progress-bar 1.5s ease-in-out infinite' }} />
    </div>
  </div>
);

/* ─── Product Image Carousel ─────────────────────────────────────────────── */
const ProductImageCarousel = ({ image, name }: { image: string; name: string }) => (
  <div className="relative h-[180px] bg-gray-50 flex items-center justify-center overflow-hidden rounded-t-xl">
    <img
      src={image}
      alt={name}
      className="h-full w-full object-contain p-4"
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";
      }}
    />
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
      ))}
    </div>
  </div>
);

/* ─── Product Card ───────────────────────────────────────────────────────── */
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

const ProductCard = ({ product, onEdit, onToast }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const deletingId = useAppSelector(selectDeletingId);
  const publishingId = useAppSelector(selectPublishingId);

  const isDeleting = deletingId === product._id;
  const isPublishing = publishingId === product._id;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const result = await dispatch(deleteProduct(product._id));
    if (deleteProduct.fulfilled.match(result)) {
      onToast('Product Deleted Successfully');
    } else {
      onToast('Failed to delete product', 'error');
    }
  };

  const handlePublish = async () => {
    const result = await dispatch(publishProduct(product._id));
    if (publishProduct.fulfilled.match(result)) {
      onToast('Product published successfully');
    } else {
      onToast('Failed to publish product', 'error');
    }
  };

  const detailRows = [
    { label: 'Product type -', value: product.productType, className: 'text-gray-800' },
    { label: 'Quantity Stock', value: product.quantityStock.toString(), className: 'text-gray-800' },
    { label: 'MRP-', value: `₹ ${product.mrp}`, className: 'text-gray-800' },
    { label: 'Selling Price -', value: `₹ ${product.sellingPrice}`, className: 'text-gray-800 font-semibold' },
    { label: 'Brand Name -', value: product.brandName, className: 'text-gray-800' },
    { label: 'Total Number of images -', value: '5', className: 'text-gray-800' },
    { label: 'Exchange Eligibility -', value: product.exchange ? 'YES' : 'NO', className: 'text-gray-800 font-bold' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <ProductImageCarousel image={product.productImage} name={product.productName} />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3 leading-tight">{product.productName}</h3>
        <div className="space-y-1.5 mb-4">
          {detailRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{row.label}</span>
              <span className={`text-xs ${row.className}`}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={handlePublish}
            disabled={isPublishing || product.isPublished}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
          >
            {isPublishing && (
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {isPublishing ? 'Publishing...' : product.isPublished ? 'Published' : 'Publish'}
          </button>

          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors duration-200"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all duration-200 flex-shrink-0"
          >
            {isDeleting ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Add / Edit Modal ───────────────────────────────────────────────────── */
interface ProductFormProps {
  editingProduct?: Product | null;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

const ProductFormModal = ({ editingProduct, onClose, onToast }: ProductFormProps) => {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsSubmitLoading);
  const isImageUploading = useAppSelector(selectIsImageUploading);
  const submitError = useAppSelector(selectSubmitError);

  const [form, setForm] = useState({
    productName: editingProduct?.productName ?? '',
    productType: editingProduct?.productType ?? '',
    brandName: editingProduct?.brandName ?? '',
    quantityStock: editingProduct?.quantityStock?.toString() ?? '',
    sellingPrice: editingProduct?.sellingPrice?.toString() ?? '',
    mrp: editingProduct?.mrp?.toString() ?? '',
    exchange: editingProduct?.exchange ?? false,
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(editingProduct?.productImage ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear store submit error on mount
  useEffect(() => {
    dispatch(clearSubmitError());
  }, [dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setFieldErrors((p) => ({ ...p, image: '' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.productName.trim()) errs.productName = 'Product name is required';
    if (!form.productType.trim()) errs.productType = 'Product type is required';
    if (!form.brandName.trim()) errs.brandName = 'Brand name is required';
    if (!form.quantityStock || isNaN(Number(form.quantityStock)) || Number(form.quantityStock) < 0)
      errs.quantityStock = 'Quantity must be a non-negative number';
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice)) || Number(form.sellingPrice) < 0)
      errs.sellingPrice = 'Selling price must be a non-negative number';
    if (!form.mrp || isNaN(Number(form.mrp)) || Number(form.mrp) < 0)
      errs.mrp = 'MRP must be a non-negative number';
    if (!editingProduct && !image) errs.image = 'Product image is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (image) fd.append('productImage', image);

    if (editingProduct) {
      const result = await dispatch(editProduct({ id: editingProduct._id, formData: fd, hasImage: !!image }));
      if (editProduct.fulfilled.match(result)) {
        onToast('Product updated successfully');
        onClose();
      }
    } else {
      const result = await dispatch(addProduct({ formData: fd, hasImage: !!image }));
      if (addProduct.fulfilled.match(result)) {
        onToast('Product added successfully');
        onClose();
      }
    }
  };

  const isLoading = isSubmitting || isImageUploading;

  const Field = ({ id, label, type = 'text', value, onChange, error }: {
    id: string; label: string; type?: string; value: string;
    onChange: (v: string) => void; error?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => { onChange(e.target.value); setFieldErrors((p) => ({ ...p, [id]: '' })); }}
        className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} disabled={isLoading} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Store-level submit error */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{submitError}</div>
          )}

          {/* Image Upload status */}
          {isImageUploading && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <svg className="animate-spin text-indigo-600 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-indigo-700">Uploading image to ImageKit…</p>
                <p className="text-xs text-indigo-500">Please wait, this may take a moment</p>
              </div>
            </div>
          )}

          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Product Image {!editingProduct && <span className="text-red-500">*</span>}
            </label>
            <div
              onClick={() => !isLoading && document.getElementById('product-image-input')?.click()}
              className={`relative h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
                isLoading
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'
              } ${fieldErrors.image ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            >
              {preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-contain p-2 rounded-xl" />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                  <span className="text-xs text-gray-400 mt-2">Click to upload image</span>
                </>
              )}
              <input id="product-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isLoading} />
            </div>
            {fieldErrors.image && <p className="text-red-500 text-xs mt-1">{fieldErrors.image}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field id="productName" label="Product Name *" value={form.productName} onChange={(v) => setForm((p) => ({ ...p, productName: v }))} error={fieldErrors.productName} />
            <Field id="productType" label="Product Type *" value={form.productType} onChange={(v) => setForm((p) => ({ ...p, productType: v }))} error={fieldErrors.productType} />
            <Field id="brandName" label="Brand Name *" value={form.brandName} onChange={(v) => setForm((p) => ({ ...p, brandName: v }))} error={fieldErrors.brandName} />
            <Field id="quantityStock" label="Quantity Stock *" type="number" value={form.quantityStock} onChange={(v) => setForm((p) => ({ ...p, quantityStock: v }))} error={fieldErrors.quantityStock} />
            <Field id="mrp" label="MRP (₹) *" type="number" value={form.mrp} onChange={(v) => setForm((p) => ({ ...p, mrp: v }))} error={fieldErrors.mrp} />
            <Field id="sellingPrice" label="Selling Price (₹) *" type="number" value={form.sellingPrice} onChange={(v) => setForm((p) => ({ ...p, sellingPrice: v }))} error={fieldErrors.sellingPrice} />
          </div>

          {/* Exchange toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Exchange Eligible</span>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setForm((p) => ({ ...p, exchange: !p.exchange }))}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.exchange ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.exchange ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {isImageUploading
              ? 'Uploading image…'
              : isSubmitting
                ? editingProduct ? 'Saving…' : 'Adding…'
                : editingProduct ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─── Skeleton Card ──────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-[180px] bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
        <div key={j} className="h-3 bg-gray-100 rounded" />
      ))}
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
        <div className="w-9 h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  </div>
);

/* ─── Products Page ──────────────────────────────────────────────────────── */
const Products = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const products = useAppSelector(selectProducts);
  const isFetching = useAppSelector(selectIsFetchLoading);
  const isImageUploading = useAppSelector(selectIsImageUploading);
  const fetchError = useAppSelector(selectProductError);

  // Local UI state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    dispatch(fetchMyProducts());
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    dispatch(clearSubmitError());
  };

  return (
    <div className="min-h-full">
      {/* Global image-upload banner (shown on top of everything when uploading) */}
      {isImageUploading && <ImageUploadBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Products</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Products
        </button>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {fetchError}
        </div>
      )}

      {/* Product Grid */}
      {isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="text-lg font-medium text-gray-500 mb-1">No products yet</p>
          <p className="text-sm text-gray-400 mb-4">Add your first product to get started</p>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEdit}
              onToast={showToast}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductFormModal
          editingProduct={editingProduct}
          onClose={closeModal}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Products;
