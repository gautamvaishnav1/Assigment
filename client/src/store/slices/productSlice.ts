import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { productApi, type Product } from '../../api/product';

/* ─── Loading Granularity ────────────────────────────────────────────────── */
interface ProductLoadingState {
  fetch: boolean;       // loading list of products
  submit: boolean;      // adding or editing a product (non-image)
  imageUpload: boolean; // image is being uploaded to ImageKit (can take time)
  delete: string | null;   // product ID currently being deleted (null = none)
  publish: string | null;  // product ID currently being published/unpublished
}

interface ProductState {
  items: Product[];
  loading: ProductLoadingState;
  error: string | null;
  submitError: string | null;
}

/* ─── Initial State ──────────────────────────────────────────────────────── */
const initialState: ProductState = {
  items: [],
  loading: {
    fetch: false,
    submit: false,
    imageUpload: false,
    delete: null,
    publish: null,
  },
  error: null,
  submitError: null,
};

/* ─── Async Thunks ───────────────────────────────────────────────────────── */

export const fetchMyProducts = createAsyncThunk(
  'products/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await productApi.getMyProducts();
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Failed to fetch products');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/add',
  async (
    { formData, hasImage }: { formData: FormData; hasImage: boolean },
    { dispatch, rejectWithValue }
  ) => {
    // Signal image-upload phase separately so UI can show specific loading
    if (hasImage) dispatch(setImageUploading(true));
    try {
      const product = await productApi.addProduct(formData);
      return product;
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ??
        err?.response?.data?.message ??
        'Failed to add product';
      return rejectWithValue(msg);
    } finally {
      if (hasImage) dispatch(setImageUploading(false));
    }
  }
);

export const editProduct = createAsyncThunk(
  'products/edit',
  async (
    { id, formData, hasImage }: { id: string; formData: FormData; hasImage: boolean },
    { dispatch, rejectWithValue }
  ) => {
    if (hasImage) dispatch(setImageUploading(true));
    try {
      const product = await productApi.editProduct(id, formData);
      return product;
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ??
        err?.response?.data?.message ??
        'Failed to update product';
      return rejectWithValue(msg);
    } finally {
      if (hasImage) dispatch(setImageUploading(false));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Failed to delete product');
    }
  }
);

export const publishProduct = createAsyncThunk(
  'products/publish',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: any = await productApi.publishProduct(id);
      // Wait, api returns { success: true, message: ... } for these new routes. 
      // The controller showed: res.status(200).json({ success: true, message: 'Product published successfully' });
      // It doesn't return the product! We need to return the ID so we can update the state manually.
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Failed to publish product');
    }
  }
);

export const unpublishProduct = createAsyncThunk(
  'products/unpublish',
  async (id: string, { rejectWithValue }) => {
    try {
      await productApi.unpublishProduct(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Failed to unpublish product');
    }
  }
);

/* ─── Slice ──────────────────────────────────────────────────────────────── */
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Explicit image-upload indicator (dispatched from thunks above)
    setImageUploading(state, action: PayloadAction<boolean>) {
      state.loading.imageUpload = action.payload;
    },
    clearSubmitError(state) {
      state.submitError = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* ── fetchMyProducts ── */
    builder
      .addCase(fetchMyProducts.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.items = action.payload;
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload as string;
      });

    /* ── addProduct ── */
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading.submit = true;
        state.submitError = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading.submit = false;
        state.items.unshift(action.payload); // newest first
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading.submit = false;
        state.submitError = action.payload as string;
      });

    /* ── editProduct ── */
    builder
      .addCase(editProduct.pending, (state) => {
        state.loading.submit = true;
        state.submitError = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.loading.submit = false;
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading.submit = false;
        state.submitError = action.payload as string;
      });

    /* ── deleteProduct ── */
    builder
      .addCase(deleteProduct.pending, (state, action) => {
        state.loading.delete = action.meta.arg; // store the id being deleted
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading.delete = null;
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.loading.delete = null;
      });

    /* ── publishProduct ── */
    builder
      .addCase(publishProduct.pending, (state, action) => {
        state.loading.publish = action.meta.arg;
      })
      .addCase(publishProduct.fulfilled, (state, action) => {
        state.loading.publish = null;
        const idx = state.items.findIndex((p) => p._id === action.payload);
        if (idx !== -1) state.items[idx].isPublished = true;
      })
      .addCase(publishProduct.rejected, (state) => {
        state.loading.publish = null;
      });

    /* ── unpublishProduct ── */
    builder
      .addCase(unpublishProduct.pending, (state, action) => {
        state.loading.publish = action.meta.arg;
      })
      .addCase(unpublishProduct.fulfilled, (state, action) => {
        state.loading.publish = null;
        const idx = state.items.findIndex((p) => p._id === action.payload);
        if (idx !== -1) state.items[idx].isPublished = false;
      })
      .addCase(unpublishProduct.rejected, (state) => {
        state.loading.publish = null;
      });
  },
});

export const { setImageUploading, clearSubmitError, clearError } = productSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectProducts = (state: { products: ProductState }) => state.products.items;
export const selectProductLoading = (state: { products: ProductState }) => state.products.loading;
export const selectProductError = (state: { products: ProductState }) => state.products.error;
export const selectSubmitError = (state: { products: ProductState }) => state.products.submitError;
export const selectIsFetchLoading = (state: { products: ProductState }) => state.products.loading.fetch;
export const selectIsSubmitLoading = (state: { products: ProductState }) => state.products.loading.submit;
export const selectIsImageUploading = (state: { products: ProductState }) => state.products.loading.imageUpload;
export const selectDeletingId = (state: { products: ProductState }) => state.products.loading.delete;
export const selectPublishingId = (state: { products: ProductState }) => state.products.loading.publish;

export default productSlice.reducer;
