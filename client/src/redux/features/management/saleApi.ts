import { baseApi } from "../baseApi";

export const saleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all sales
    getAllSale: builder.query<{
      success: boolean;
      statusCode: number;
      message: string;
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPage: number;
      };
      data: any[];
    }, void>({
      query: () => ({
        url: '/sales',
        method: 'GET',
      }),
      providesTags: ['sale'],
    }),

    // Create a new sale
    createSale: builder.mutation<any, any>({
      query: (payload) => ({
        url: '/sales',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['sale'],
    }),

    // Daily sales
    dailySale: builder.query<{ success: boolean; statusCode: number; message: string; data: any[] }, void>({
      query: () => ({
        url: '/sales/days',
        method: 'GET',
      }),
      providesTags: ['sale'],
    }),

    // Weekly sales
    weeklySale: builder.query<{ success: boolean; statusCode: number; message: string; data: any[] }, void>({
      query: () => ({
        url: '/sales/weeks',
        method: 'GET',
      }),
      providesTags: ['sale'],
    }),

    // Monthly sales
    monthlySale: builder.query<{ success: boolean; statusCode: number; message: string; data: any[] }, void>({
      query: () => ({
        url: '/sales/months',
        method: 'GET',
      }),
      providesTags: ['sale'],
    }),

    // Yearly sales
    yearlySale: builder.query<{ success: boolean; statusCode: number; message: string; data: any[] }, void>({
      query: () => ({
        url: '/sales/years',
        method: 'GET',
      }),
      providesTags: ['sale'],
    }),
  }),
});

export const {
  useGetAllSaleQuery,
  useCreateSaleMutation,
  useDailySaleQuery,
  useWeeklySaleQuery,
  useMonthlySaleQuery,
  useYearlySaleQuery,
} = saleApi;
