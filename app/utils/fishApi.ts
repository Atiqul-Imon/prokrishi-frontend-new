import axios from "axios";
import { getApiBaseUrl } from "./env";

const buildFishApiBase = () => {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/fish-product`; // NestJS uses /fish-product, not /fish
};

const fishApi = axios.create({
  withCredentials: true,
  timeout: 20000,
});

fishApi.interceptors.request.use(
  (config) => {
    config.baseURL = buildFishApiBase();
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

fishApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isDashboardRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard");
      const isLoginRoute = typeof window !== "undefined" && window.location.pathname.includes("/login");
      if (isDashboardRoute) return Promise.reject(error);
      if (!isLoginRoute && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const fishProductApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    isFeatured?: boolean;
    category?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) => {
    // NestJS endpoint is /api/fish-product (not /api/fish/products)
    // Use the base API URL directly
    const base = getApiBaseUrl().replace(/\/$/, "");
    const timestamp = Date.now();
    const queryParams = { ...params, t: timestamp };
    const response = await axios.get(`${base}/fish-product`, {
      params: queryParams,
      headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : "",
      },
    });
    // NestJS TransformInterceptor wraps response in { success: true, data: { message, fishProducts, pagination, success } }
    const responseData = response.data?.data || response.data;
    return {
      success: responseData.success ?? true,
      fishProducts: responseData.fishProducts || [],
      pagination: responseData.pagination || {},
    };
  },

  getFeatured: async (limit?: number) => {
    const timestamp = Date.now();
    const params = limit ? { limit, t: timestamp } : { t: timestamp };
    // NestJS endpoint is /api/fish-product/featured (not /fish/product/featured)
    // Use the base API URL directly, not the fishApi base
    const base = getApiBaseUrl().replace(/\/$/, "");
    const response = await axios.get(`${base}/fish-product/featured`, { 
      params,
      headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : "",
      },
    });
    // NestJS returns { success: true, data: { message, fishProducts } }
    return {
      success: response.data.success || true,
      fishProducts: response.data.data?.fishProducts || response.data.fishProducts || [],
    };
  },

  getById: async (id: string) => {
    // NestJS endpoint: /api/fish-product/:id (base is already /fish-product)
    const response = await fishApi.get(`/${id}`);
    // NestJS returns { success: true, data: { message, fishProduct: {...} } }
    const responseData = response.data?.data || response.data;
    return {
      ...responseData,
      fishProduct: responseData?.fishProduct || responseData,
    };
  },

  create: async (data: FormData) => {
    // Backend endpoint: POST /fish-product (base is already /fish-product)
    const response = await fishApi.post("", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // NestJS returns { success: true, data: { message, fishProduct } }
    const responseData = response.data?.data || response.data;
    return {
      ...responseData,
      fishProduct: responseData?.fishProduct || responseData,
    };
  },

  update: async (id: string, data: FormData) => {
    // Backend endpoint: PUT /fish-product/:id (base is already /fish-product)
    const response = await fishApi.put(`/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // NestJS returns { success: true, data: { message, fishProduct } }
    const responseData = response.data?.data || response.data;
    return {
      ...responseData,
      fishProduct: responseData?.fishProduct || responseData,
    };
  },

  delete: async (id: string) => {
    // Backend endpoint: DELETE /fish-product/:id (base is already /fish-product)
    const response = await fishApi.delete(`/${id}`);
    // NestJS returns { success: true, data: { message } }
    const responseData = response.data?.data || response.data;
    return responseData || response.data;
  },

  toggleFeatured: async (id: string) => {
    // Backend endpoint: PUT /fish-product/:id/toggle-featured (base is already /fish-product)
    const response = await fishApi.put(`/${id}/toggle-featured`, {});
    // NestJS returns { success: true, data: { message, fishProduct } }
    const responseData = response.data?.data || response.data;
    return {
      ...responseData,
      fishProduct: responseData?.fishProduct || responseData,
    };
  },
};

export const fishOrderApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) => {
    // NestJS endpoint: /api/fish-order/all (for admin)
    const base = getApiBaseUrl().replace(/\/$/, "");
    const response = await axios.get(`${base}/fish-order/all`, {
      params,
      headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : "",
      },
    });
    // NestJS TransformInterceptor wraps response in { success: true, data: { message, fishOrders, pagination } }
    const responseData = response.data?.data || response.data;
    return {
      success: responseData.success ?? true,
      message: responseData.message || 'Fish orders fetched successfully',
      fishOrders: responseData.fishOrders || [],
      pagination: responseData.pagination || {},
    };
  },

  getById: async (id: string) => {
    const response = await fishApi.get(`/${id}`); // NestJS endpoint: /api/fish-product/:id
    // NestJS returns { success: true, data: { fishProduct: {...} } }
    const responseData = response.data?.data || response.data;
    return {
      ...responseData,
      fishProduct: responseData?.fishProduct || responseData,
    };
  },

  create: async (data: {
    orderItems: Array<{
      fishProduct: string;
      sizeCategoryId: string;
      requestedWeight?: number;
      quantity?: number; // CRITICAL: Add quantity field
      notes?: string;
    }>;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      division?: string;
      district?: string;
      upazila?: string;
      postalCode?: string;
    };
    paymentMethod?: string;
    totalPrice?: number;
    shippingZone?: 'inside_dhaka' | 'outside_dhaka';
    guestInfo?: {
      name: string;
      email?: string;
      phone: string;
    };
    notes?: string;
  }) => {
    // Fish orders use /fish-order endpoint, not /fish/orders
    const base = getApiBaseUrl().replace(/\/$/, "");
    
    // CRITICAL: Log the data being sent to verify quantity is included
    console.log('[FISH API] Creating fish order with data:', JSON.stringify(data, null, 2));
    console.log('[FISH API] Order items quantities:', data.orderItems.map(item => ({ 
      fishProduct: item.fishProduct, 
      sizeCategoryId: item.sizeCategoryId, 
      quantity: item.quantity,
      requestedWeight: item.requestedWeight 
    })));
    
    const response = await axios.post(`${base}/fish-order`, data, {
      headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : "",
      },
    });
    // NestJS returns { success: true, data: { message, fishOrder: {...} } }
    const responseData = response.data?.data || response.data;
    return {
      ...responseData,
      // Include _id at top level for backward compatibility
      _id: responseData?.fishOrder?._id || responseData?._id,
      fishOrder: responseData?.fishOrder || responseData,
    };
  },

  updateStatus: async (id: string, data: { status?: string; paymentStatus?: string; notes?: string; cancellationReason?: string }) => {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const response = await axios.put(`${base}/fish-order/${id}`, data, {
      headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : "",
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const response = await axios.delete(`${base}/fish-order/${id}`, {
      headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : "",
      },
    });
    return response.data;
  },

  getStats: async (period: number = 30) => {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const response = await axios.get(`${base}/fish-order/stats`, {
      params: { period },
      headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : "",
      },
    });
    // NestJS returns { message, success, stats }
    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Fish order statistics fetched successfully',
      stats: response.data.stats || {},
    };
  },
};

export default fishApi;

