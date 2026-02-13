import { z } from "zod";

type RawSearchParams = { [key: string]: string | string[] | undefined };

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const report1ParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  minIngresos: z.coerce.number().min(0).optional(),
});

export type Report1Params = z.infer<typeof report1ParamsSchema>;

export const parseReport1Params = (params: RawSearchParams): Report1Params => {
  const data = {
    page: normalizeParam(params.page),
    pageSize: normalizeParam(params.pageSize),
    minIngresos: normalizeParam(params.minIngresos),
  };

  const result = report1ParamsSchema.safeParse(data);
  return result.success ? result.data : report1ParamsSchema.parse({});
};

export const report2ParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  minGastado: z.coerce.number().min(0).optional(),
  minPedidos: z.coerce.number().int().min(0).optional(),
});

export type Report2Params = z.infer<typeof report2ParamsSchema>;

export const parseReport2Params = (params: RawSearchParams): Report2Params => {
  const data = {
    page: normalizeParam(params.page),
    pageSize: normalizeParam(params.pageSize),
    minGastado: normalizeParam(params.minGastado),
    minPedidos: normalizeParam(params.minPedidos),
  };

  const result = report2ParamsSchema.safeParse(data);
  return result.success ? result.data : report2ParamsSchema.parse({});
};

export const report3ParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  minTotalVendido: z.coerce.number().min(0).optional(),
});

export type Report3Params = z.infer<typeof report3ParamsSchema>;

export const parseReport3Params = (params: RawSearchParams): Report3Params => {
  const data = {
    page: normalizeParam(params.page),
    pageSize: normalizeParam(params.pageSize),
    minTotalVendido: normalizeParam(params.minTotalVendido),
  };

  const result = report3ParamsSchema.safeParse(data);
  return result.success ? result.data : report3ParamsSchema.parse({});
};

export const report5ParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  minTotalCategoria: z.coerce.number().min(0).optional(),
});

export type Report5Params = z.infer<typeof report5ParamsSchema>;

export const parseReport5Params = (params: RawSearchParams): Report5Params => {
  const data = {
    page: normalizeParam(params.page),
    pageSize: normalizeParam(params.pageSize),
    minTotalCategoria: normalizeParam(params.minTotalCategoria),
  };

  const result = report5ParamsSchema.safeParse(data);
  return result.success ? result.data : report5ParamsSchema.parse({});
};
